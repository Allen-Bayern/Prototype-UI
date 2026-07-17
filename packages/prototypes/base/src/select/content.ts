import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asBoundary, asFocusRoving, asFocusScope, asOverlay } from '@proto.ui/hooks';
import { useFocusRoving } from '../behaviors';
import { SELECT_CONTEXT, SELECT_FAMILY } from './shared';
import type {
  SelectContentAsHookContract,
  SelectContentExposes,
  SelectContentProps,
} from './types';

function setupSelectContent(def: DefHandle<SelectContentProps, SelectContentExposes>): void {
  def.anatomy.claim(SELECT_FAMILY, { role: 'content' });
  let activeValue = '';
  let selectedValue = '';
  const focusScope = asFocusScope<SelectContentProps>();
  focusScope.configure({ entry: 'manual', restore: 'previous' });
  const focusRoving = asFocusRoving<SelectContentProps>();
  focusRoving.configure({
    navigation: 'none',
    orientation: 'vertical',
    entry: 'manual',
  });
  const roving = useFocusRoving({
    family: SELECT_FAMILY,
    itemRole: 'item',
    loop: false,
    skipDisabled: true,
    getId: (snapshot) => {
      const value = snapshot.value;
      return typeof value === 'string' && value ? value : null;
    },
    getActiveId: () => activeValue,
    getCurrentId: () => selectedValue,
    exposeFocusCurrentMethodKey: 'focusSelected',
  });
  const focusById = roving.getMethod?.('focusById') as
    | ((id: string, options?: { reason?: 'programmatic' | 'keyboard' | 'pointer' }) => boolean)
    | undefined;
  const focusFirst = roving.getMethod?.('focusFirst') as (() => boolean) | undefined;
  const focusLast = roving.getMethod?.('focusLast') as (() => boolean) | undefined;
  const overlay = asOverlay<SelectContentProps>();
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
  let mountedRun: any = null;
  let entryFocusRequested = false;

  const resolveBoundaryValue = (run: any, boundary: 'first' | 'last' = 'first') => {
    const items = run.anatomy.partsOf(SELECT_FAMILY, 'item');
    const ordered = boundary === 'first' ? items : items.slice().reverse();
    for (const item of ordered) {
      const snapshot = (
        item.getExpose('getCollectionItem') as (() => Record<string, unknown>) | null
      )?.();
      if (!snapshot || snapshot.disabled) continue;
      const value = snapshot.value;
      if (typeof value === 'string' && value) return value;
    }
    return '';
  };

  const resolveOpenFocusAction = (run: any, ctx: { activeValue?: string; value?: string }) => {
    const preferredValues = [ctx.value, ctx.activeValue].filter(
      (value): value is string => typeof value === 'string' && value.length > 0
    );
    for (const value of preferredValues) {
      if (focusById?.(value, { reason: 'keyboard' })) return true;
    }
    // A preferred Item may join later in the same adapter projection. Do not
    // prematurely lock entry focus to the first partial Anatomy snapshot.
    if (preferredValues.length > 0) return false;
    const boundaryValue = resolveBoundaryValue(run, 'first');
    if (boundaryValue) {
      activeValue = boundaryValue;
      if (!(ctx.activeValue ?? '') && !(ctx.value ?? '')) {
        run.context.update(SELECT_CONTEXT, (prev: any) => ({
          ...prev,
          activeValue: boundaryValue,
        }));
      }
      return focusById?.(boundaryValue, { reason: 'keyboard' }) ?? false;
    }
    return focusFirst?.() ?? false;
  };

  // Structural readiness comes from Anatomy; Focus bridges the remaining gap
  // until the selected Item's host target is committed by its adapter.
  def.anatomy.subscribeParts(SELECT_FAMILY, 'item', (run, parts) => {
    if (parts.length === 0 || !open.get() || entryFocusRequested) return;
    const ctx = run.context.read(SELECT_CONTEXT);
    if (!ctx.open) return;
    entryFocusRequested = resolveOpenFocusAction(run, ctx);
  });

  // Collection metadata becomes semantic-ready in each Item's mounted callback,
  // which is intentionally distinct from its earlier Anatomy claim.
  def.expose.method('__resolveSelectEntryFocus' as any, () => {
    const run = mountedRun;
    if (!run || !open.get() || entryFocusRequested) return false;
    const ctx = run.context.read(SELECT_CONTEXT);
    if (!ctx.open) return false;
    entryFocusRequested = resolveOpenFocusAction(run, ctx);
    return entryFocusRequested;
  });

  const focusSelectedOrBoundary = (run: any, boundary: 'first' | 'last' = 'first') => {
    if (focusById?.(run.context.read(SELECT_CONTEXT).value ?? '', { reason: 'keyboard' })) {
      return true;
    }
    if (boundary === 'last') {
      focusLast?.();
      return false;
    }
    focusFirst?.();
    return false;
  };

  def.expose.state('open', open);

  def.context.subscribe(SELECT_CONTEXT, (run, next) => {
    const previousSelectedValue = selectedValue;
    activeValue = next.activeValue ?? '';
    selectedValue = next.value ?? '';
    const wasOpen = open.get();
    open.set(next.open, 'reason: select context sync => content open');
    if (next.open) {
      if (!wasOpen) {
        overlay.openOverlay('controlled.sync');
        focusScope.activate();
        entryFocusRequested = resolveOpenFocusAction(run, next);
      }
      if (wasOpen && selectedValue && selectedValue !== previousSelectedValue) {
        entryFocusRequested = resolveOpenFocusAction(run, {
          value: selectedValue,
          activeValue: '',
        });
      }
      return;
    }
    entryFocusRequested = false;
    if (wasOpen) {
      focusScope.deactivate();
      overlay.close('controlled.sync');
    }
  });

  def.lifecycle.onMounted((run) => {
    mountedRun = run;
    const ctx = run.context.read(SELECT_CONTEXT);
    activeValue = ctx.activeValue ?? '';
    selectedValue = ctx.value ?? '';
    open.set(ctx.open, 'reason: lifecycle.onMounted => content open sync');
    if (ctx.open) {
      overlay.openOverlay('controlled.sync');
      focusScope.activate();
      entryFocusRequested = resolveOpenFocusAction(run, ctx);
    } else {
      entryFocusRequested = false;
      focusScope.deactivate();
      overlay.close('controlled.sync');
    }
  });

  overlay.open.watch((run, event) => {
    if (event.type !== 'next') return;
    const ctx = mountedRun?.context.read(SELECT_CONTEXT);
    if (!ctx) return;
    if (!event.next) {
      focusScope.deactivate();
      if (!ctx.controlledOpen) {
        activeValue = '';
        mountedRun.context.update(SELECT_CONTEXT, (prev: any) => ({
          ...prev,
          open: false,
          activeValue: '',
        }));
      }
      return;
    }

    if (!ctx.controlledOpen && !ctx.open) {
      mountedRun.context.update(SELECT_CONTEXT, (prev: any) => ({
        ...prev,
        open: true,
        activeValue: prev.value,
      }));
    }
  });

  def.event.onGlobal('key.down', (run, ev) => {
    const ctx = run.context.read(SELECT_CONTEXT);
    if (!ctx.open || ctx.disabled) return;
    if (ev?.detail?.key !== 'Escape') return;
    if (ctx.controlledOpen) return;
    activeValue = '';
    run.context.update(SELECT_CONTEXT, (prev: any) => ({
      ...prev,
      open: false,
      activeValue: '',
    }));
  });

  boundary.subscribeOutside(() => {
    const run = mountedRun;
    if (!run) return;
    const ctx = run.context.read(SELECT_CONTEXT);
    if (!ctx.open || ctx.disabled || ctx.controlledOpen) return;
    overlay.close('outside.press');
  });

  def.rule({
    when: (w) => w.state(open).eq(false),
    intent: (i) => i.feedback.style.use(tw('hidden')),
  });

  def.lifecycle.onUnmounted(() => {
    mountedRun = null;
    activeValue = '';
    selectedValue = '';
    entryFocusRequested = false;
  });
}

export const asSelectContent = defineAsHook<
  SelectContentProps,
  SelectContentExposes,
  SelectContentAsHookContract
>({
  name: 'as-select-content',
  setup: setupSelectContent,
});

const selectContent = definePrototype({
  name: 'base-select-content',
  setup: setupSelectContent,
});

export default selectContent;
