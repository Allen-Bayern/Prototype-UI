import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asBoundary, asFocusRoving, asFocusScope, asOverlay } from '@proto.ui/hooks';
import { useFocusRoving } from '../behaviors';
import { DROPDOWN_CONTEXT, DROPDOWN_FAMILY } from './shared';
import type {
  DropdownContentAsHookContract,
  DropdownContentExposes,
  DropdownContentProps,
} from './types';

const DROPDOWN_TYPEAHEAD_HANDLED = '__dropdownTypeaheadHandled';
const DROPDOWN_OPEN_HANDLED = '__dropdownOpenHandled';

function setupDropdownContent(
  def: DefHandle<DropdownContentProps, DropdownContentExposes>,
  _options?: void,
  api?: { store: Record<string, unknown> }
): void {
  def.anatomy.claim(DROPDOWN_FAMILY, { role: 'content' });
  let activeValue = '';
  const focusScope = asFocusScope<DropdownContentProps>();
  focusScope.configure({ entry: 'manual', restore: 'previous' });
  const focusRoving = asFocusRoving<DropdownContentProps>();
  focusRoving.configure({
    navigation: 'none',
    orientation: 'vertical',
    entry: 'manual',
  });
  const roving = useFocusRoving({
    family: DROPDOWN_FAMILY,
    itemRole: 'item',
    loop: false,
    skipDisabled: true,
    getId: (snapshot) => {
      const value = snapshot.value;
      return typeof value === 'string' && value ? value : null;
    },
    getActiveId: () => activeValue,
  });
  const focusById = roving.getMethod?.('focusById') as
    | ((id: string, options?: { reason?: 'programmatic' | 'keyboard' | 'pointer' }) => boolean)
    | undefined;
  const focusFirst = roving.getMethod?.('focusFirst') as (() => boolean) | undefined;
  const focusLast = roving.getMethod?.('focusLast') as (() => boolean) | undefined;

  const overlay = asOverlay<DropdownContentProps>();
  overlay.keepMounted();
  overlay.configure({
    closeOnEscape: false,
    closeOnOutsidePress: false,
    restore: 'trigger',
    entry: 'content',
  });
  const boundary = asBoundary();
  boundary.observe('pointer.press');
  const open = def.state.bool('open', false);
  const store = (api?.store ?? {}) as {
    typeahead: string;
    typeaheadTimer: ReturnType<typeof globalThis.setTimeout> | null;
    run: any;
  };
  store.typeahead = '';
  store.typeaheadTimer = null;
  store.run = null as any;

  const clearTypeahead = () => {
    if (store.typeaheadTimer) {
      clearTimeout(store.typeaheadTimer);
      store.typeaheadTimer = null;
    }
    store.typeahead = '';
  };

  const resolveOpenFocusAction = (
    _run: any,
    ctx: { activeValue?: string; openEntry?: string; openEntryValue?: string }
  ) => {
    if (ctx.openEntry === 'last') {
      focusLast?.();
      return;
    }
    if (
      ctx.openEntry === 'value-or-first' &&
      focusById?.(ctx.openEntryValue ?? '', { reason: 'keyboard' })
    ) {
      return;
    }
    if (ctx.openEntry !== 'first' && focusById?.(ctx.activeValue ?? '', { reason: 'keyboard' })) {
      return;
    }
    focusFirst?.();
  };

  const scheduleOpenFocusAction = (run: any) => {
    globalThis.queueMicrotask(() => {
      const ctx = run.context.read(DROPDOWN_CONTEXT);
      if (!ctx.open) return;
      resolveOpenFocusAction(run, ctx);
    });
  };

  def.expose.state('open', open);
  def.context.subscribe(DROPDOWN_CONTEXT, (_run, next) => {
    activeValue = next.activeValue ?? '';
    const wasOpen = open.get();
    open.set(next.open, 'reason: dropdown context sync => content open');
    if (next.open) {
      if (!wasOpen) {
        overlay.openOverlay('controlled.sync');
        focusScope.activate();
        resolveOpenFocusAction(_run, next);
        scheduleOpenFocusAction(_run);
      }
      return;
    }
    clearTypeahead();
    if (wasOpen) {
      focusScope.deactivate();
      overlay.close('controlled.sync');
    }
  });

  def.lifecycle.onMounted((run) => {
    store.run = run;
    const ctx = run.context.read(DROPDOWN_CONTEXT);
    activeValue = ctx.activeValue ?? '';
    open.set(ctx.open, 'reason: lifecycle.onMounted => content open sync');
    if (ctx.open) {
      overlay.openOverlay('controlled.sync');
      focusScope.activate();
      resolveOpenFocusAction(run, ctx);
      scheduleOpenFocusAction(run);
    } else {
      focusScope.deactivate();
      overlay.close('controlled.sync');
    }
  });

  overlay.open.watch((_ctx, event) => {
    if (event.type !== 'next') return;
    const run = store.run;
    if (!run) return;
    const ctx = run.context.read(DROPDOWN_CONTEXT);
    if (event.next) {
      if (!ctx.controlled && !ctx.open) {
        run.context.update(DROPDOWN_CONTEXT, (prev: any) => ({ ...prev, open: true }));
      }
      return;
    }
    clearTypeahead();
    focusScope.deactivate();
    if (ctx.controlled) return;
    activeValue = '';
    run.context.update(DROPDOWN_CONTEXT, (prev: any) => ({
      ...prev,
      open: false,
      activeValue: '',
    }));
  });

  def.event.onGlobal('key.down', (run, ev) => {
    const ctx = run.context.read(DROPDOWN_CONTEXT);
    if (!ctx.open || ctx.disabled) return;
    if ((ev?.detail as any)?.[DROPDOWN_TYPEAHEAD_HANDLED]) return;
    if ((ev?.detail as any)?.[DROPDOWN_OPEN_HANDLED]) return;

    const key = ev?.detail?.key;
    if (key === 'Escape') {
      if (ctx.controlled) return;
      run.context.update(DROPDOWN_CONTEXT, (prev: any) => ({
        ...prev,
        open: false,
        activeValue: '',
      }));
      return;
    }
    if (typeof key !== 'string' || key.length !== 1) return;
    if (ev?.detail?.ctrlKey || ev?.detail?.metaKey || ev?.detail?.altKey) return;

    const nextBuffer = `${store.typeahead}${key}`.toLowerCase();
    store.typeahead = nextBuffer;
    if (store.typeaheadTimer) {
      clearTimeout(store.typeaheadTimer);
    }
    store.typeaheadTimer = globalThis.setTimeout(() => {
      store.typeahead = '';
      store.typeaheadTimer = null;
    }, 400);

    const items = run.anatomy.partsOf(DROPDOWN_FAMILY, 'item');
    const snapshots = items
      .map((item) => ({
        snapshot: (
          item.getExpose('getCollectionItem') as (() => Record<string, unknown>) | null
        )?.(),
      }))
      .filter((entry) => entry.snapshot && !entry.snapshot.disabled);
    if (snapshots.length === 0) return;

    const startIndex = Math.max(
      snapshots.findIndex((entry) => entry.snapshot?.value === ctx.activeValue),
      -1
    );
    const findMatch = (buffer: string) => {
      for (let step = 1; step <= snapshots.length; step++) {
        const entry = snapshots[(startIndex + step) % snapshots.length]!;
        const label = String(
          entry.snapshot?.textValue || entry.snapshot?.value || ''
        ).toLowerCase();
        if (!label.startsWith(buffer)) continue;
        return entry;
      }
      return null;
    };

    const match = findMatch(nextBuffer) ?? findMatch(String(key).toLowerCase());
    if (!match) return;
    if (ev?.detail) (ev.detail as any)[DROPDOWN_TYPEAHEAD_HANDLED] = true;
    focusById?.(String(match.snapshot?.value ?? ''), { reason: 'keyboard' });
  });

  boundary.subscribeOutside(() => {
    const run = store.run;
    if (!run) return;
    const ctx = run.context.read(DROPDOWN_CONTEXT);
    if (!ctx.open || ctx.disabled || ctx.controlled) return;
    overlay.close('outside.press');
  });

  def.lifecycle.onUnmounted(() => {
    clearTypeahead();
    store.run = null;
    activeValue = '';
  });

  def.rule({
    when: (w) => w.state(open).eq(false),
    intent: (i) => i.feedback.style.use(tw('hidden')),
  });
}

export const asDropdownContent = defineAsHook<
  DropdownContentProps,
  DropdownContentExposes,
  DropdownContentAsHookContract
>({
  name: 'as-dropdown-content',
  setup: setupDropdownContent,
});

const dropdownContent = definePrototype({
  name: 'base-dropdown-content',
  setup(def) {
    setupDropdownContent(def);
  },
});

export default dropdownContent;
