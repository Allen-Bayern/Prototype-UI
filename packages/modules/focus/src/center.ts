import type {
  FocusRequestOptions,
  FocusRovingKey,
  FocusableConfig,
  FocusRovingConfig,
  FocusFacts,
  FocusScopeConfig,
} from '@proto.ui/core';
import type { FocusInstanceToken, FocusParentGetter } from './caps';

export type FocusRequestBehavior = Readonly<{
  bypassGate?: boolean;
  syncFacts?: boolean;
}>;

export type FocusCenterEntry = {
  instance: FocusInstanceToken;
  getParent: FocusParentGetter;
  isFocusable(): boolean;
  isScopeProvider(): boolean;
  isRovingProvider(): boolean;
  getFocusableConfig(): FocusableConfig;
  getScopeConfig(): FocusScopeConfig;
  getRovingConfig(): FocusRovingConfig;
  getFacts(): FocusFacts;
  getRootTarget(): HTMLElement | null;
  requestFocus(options?: FocusRequestOptions, behavior?: FocusRequestBehavior): void;
  setScopeActive(active: boolean): void;
  pushWarning(message: string): void;
};

type ActiveScopeRecord = {
  scope: FocusInstanceToken;
  previous: FocusInstanceToken | null;
};

export class FocusCenter {
  private readonly entries = new Map<FocusInstanceToken, FocusCenterEntry>();
  private readonly activeScopes: ActiveScopeRecord[] = [];
  private currentFocused: FocusInstanceToken | null = null;

  upsert(entry: FocusCenterEntry): void {
    this.entries.set(entry.instance, entry);
  }

  remove(instance: FocusInstanceToken): void {
    this.entries.delete(instance);
    if (this.currentFocused === instance) this.currentFocused = null;
    for (let i = this.activeScopes.length - 1; i >= 0; i--) {
      if (this.activeScopes[i]?.scope === instance || this.activeScopes[i]?.previous === instance) {
        this.activeScopes.splice(i, 1);
      }
    }
  }

  private resolveKeyedRovingProvider(
    instance: FocusInstanceToken,
    groupKey: FocusRovingKey,
    getParent: FocusParentGetter
  ): FocusInstanceToken | null {
    let cur: FocusInstanceToken | null = instance;
    while (cur) {
      const entry = this.entries.get(cur);
      if (entry?.getRovingConfig().key === groupKey) {
        return cur;
      }
      cur = getParent(cur);
    }
    return null;
  }

  private resolveNearestRovingProvider(
    instance: FocusInstanceToken,
    getParent: FocusParentGetter
  ): FocusInstanceToken | null {
    let cur = getParent(instance);
    while (cur) {
      const entry = this.entries.get(cur);
      if (entry?.isRovingProvider()) return cur;
      cur = getParent(cur);
    }
    return null;
  }

  private compareEntries(a: FocusCenterEntry, b: FocusCenterEntry): number {
    const aEl = a.getRootTarget();
    const bEl = b.getRootTarget();
    if (!aEl || !bEl || aEl === bEl) return 0;
    const pos = aEl.compareDocumentPosition(bEl);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  }

  private isDescendantOf(entry: FocusCenterEntry, ancestor: FocusCenterEntry): boolean {
    if (entry.instance === ancestor.instance) return true;
    let cur = entry.getParent(entry.instance);
    while (cur) {
      if (cur === ancestor.instance) return true;
      cur = entry.getParent(cur);
    }
    return false;
  }

  private getTopActiveScope(): FocusCenterEntry | null {
    for (let i = this.activeScopes.length - 1; i >= 0; i--) {
      const entry = this.entries.get(this.activeScopes[i]!.scope);
      if (entry?.isScopeProvider()) return entry;
      this.activeScopes.splice(i, 1);
    }
    return null;
  }

  private getFocusedEntry(): FocusCenterEntry | null {
    if (this.currentFocused) {
      const entry = this.entries.get(this.currentFocused);
      if (entry) return entry;
      this.currentFocused = null;
    }
    return Array.from(this.entries.values()).find((entry) => entry.getFacts().focused) ?? null;
  }

  private getScopeMembers(scope: FocusCenterEntry): FocusCenterEntry[] {
    if (!scope.isScopeProvider()) return [];
    const members = Array.from(this.entries.values()).filter((entry) => {
      if (!entry.isFocusable()) return false;
      if (entry.instance === scope.instance) return false;
      const focusable = entry.getFocusableConfig();
      if (focusable.disabled) return false;
      return this.isDescendantOf(entry, scope);
    });
    return members.sort((a, b) => this.compareEntries(a, b));
  }

  private requestFocusAllowed(entry: FocusCenterEntry): boolean {
    const scope = this.getTopActiveScope();
    if (!scope) return true;
    return this.isDescendantOf(entry, scope);
  }

  requestFocus(
    entry: FocusCenterEntry,
    options?: FocusRequestOptions,
    behavior?: FocusRequestBehavior
  ): boolean {
    if (!behavior?.bypassGate && !this.requestFocusAllowed(entry)) {
      const scope = this.getTopActiveScope();
      entry.pushWarning(
        `[Focus] requestFocus ignored: active scope ${String(
          scope?.getScopeConfig().key?.meta?.debugLabel ?? scope?.instance ?? 'unknown'
        )} does not contain the requesting focus target.`
      );
      return false;
    }
    entry.requestFocus(options, behavior);
    if (behavior?.syncFacts !== false) {
      this.currentFocused = entry.instance;
    }
    return true;
  }

  activateScope(scope: FocusCenterEntry): boolean {
    if (!scope.isScopeProvider()) return false;

    const existingIndex = this.activeScopes.findIndex((record) => record.scope === scope.instance);
    if (existingIndex >= 0) {
      this.activeScopes.splice(existingIndex, 1);
    }

    const focused = this.getFocusedEntry();
    const previous = focused && !this.isDescendantOf(focused, scope) ? focused.instance : null;
    this.activeScopes.push({ scope: scope.instance, previous });
    scope.setScopeActive(true);

    if (scope.getScopeConfig().entry === 'manual') return true;

    const target = scope.isRovingProvider()
      ? (this.getRovingMembers(scope)[0] ?? null)
      : (this.getScopeMembers(scope)[0] ?? null);
    if (target) {
      this.requestFocus(target, { reason: 'programmatic' }, { syncFacts: true });
      return true;
    }

    if (scope.getScopeConfig().emptyPolicy === 'container') return true;
    this.activeScopes.pop();
    scope.setScopeActive(false);
    return false;
  }

  deactivateScope(scope: FocusCenterEntry): boolean {
    let index = -1;
    for (let i = this.activeScopes.length - 1; i >= 0; i--) {
      if (this.activeScopes[i]?.scope === scope.instance) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      scope.setScopeActive(false);
      return false;
    }

    const [{ previous }] = this.activeScopes.splice(index, 1);
    scope.setScopeActive(false);

    const previousEntry = previous ? (this.entries.get(previous) ?? null) : null;
    if (previousEntry) {
      this.requestFocus(
        previousEntry,
        { reason: 'programmatic' },
        {
          bypassGate: true,
          syncFacts: true,
        }
      );
    }
    return true;
  }

  isScopeActive(scope: FocusCenterEntry): boolean {
    return this.activeScopes.some((record) => record.scope === scope.instance);
  }

  getRovingMembers(provider: FocusCenterEntry): FocusCenterEntry[] {
    const groupKey = provider.getRovingConfig().key;
    if (!provider.isRovingProvider()) return [];

    const members = Array.from(this.entries.values()).filter((entry) => {
      if (!entry.isFocusable()) return false;
      if (entry.instance === provider.instance) return false;

      const focusable = entry.getFocusableConfig();
      if (focusable.disabled) return false;
      if (focusable.navParticipation === 'none') return false;

      if (focusable.groupKey) {
        if (!groupKey || focusable.groupKey !== groupKey) return false;
        const resolved = this.resolveKeyedRovingProvider(
          entry.instance,
          focusable.groupKey,
          entry.getParent
        );
        if (resolved === provider.instance) return true;

        // Compatibility fallback for hosts/tests that cannot provide a logical parent chain yet.
        return resolved === null && entry.getParent(entry.instance) === null;
      }

      const resolved = this.resolveNearestRovingProvider(entry.instance, entry.getParent);
      return resolved === provider.instance;
    });

    return members.sort((a, b) => this.compareEntries(a, b));
  }

  focusInRoving(
    provider: FocusCenterEntry,
    op: 'first' | 'last' | 'next' | 'prev' | 'selected'
  ): void {
    const members = this.getRovingMembers(provider);
    if (members.length === 0) return;

    const currentIndex = members.findIndex((entry) => entry.getFacts().focused);
    const loop = provider.getRovingConfig().loop;

    let target: FocusCenterEntry | null = null;
    if (op === 'first' || op === 'selected') {
      target = members[0] ?? null;
    } else if (op === 'last') {
      target = members[members.length - 1] ?? null;
    } else if (currentIndex >= 0) {
      const delta = op === 'next' ? 1 : -1;
      let nextIndex = currentIndex + delta;
      if (loop) {
        nextIndex = (nextIndex + members.length) % members.length;
      }
      target = members[nextIndex] ?? null;
    } else {
      target = op === 'prev' ? (members[members.length - 1] ?? null) : (members[0] ?? null);
    }

    if (target) this.requestFocus(target, { reason: 'keyboard' }, { syncFacts: false });
  }
}

export const FOCUS_CENTER = new FocusCenter();
