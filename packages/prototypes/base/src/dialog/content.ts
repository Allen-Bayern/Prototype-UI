import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asBoundary, asFocusScope, asOverlay } from '@proto.ui/hooks';
import { asTransition } from '../tools';
import { DIALOG_CONTEXT, DIALOG_FAMILY, type DialogOpenFocusReason } from './shared';
import type {
  DialogContentAsHookContract,
  DialogContentExposes,
  DialogContentHandles,
  DialogContentProps,
} from './types';
import type { TransitionHandles } from '../transition/types';

function projectDialogContentHandle(
  result: import('@proto.ui/core').AsHookResult<DialogContentProps, DialogContentAsHookContract>
): DialogContentHandles {
  const open = result.getState?.('open');
  const asTransition = result.getAsHookHandle?.<TransitionHandles>('asTransition');
  if (!open || !asTransition) {
    throw new Error('[as-dialog-content] missing captured Dialog or Transition handles.');
  }
  return { stateHandles: { open }, asTransition };
}

function setupDialogContent(def: DefHandle<DialogContentProps, DialogContentExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'content' });

  def.props.define({
    alert: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    alert: false,
  });

  const alertProp = def.state.bool('alert', false);

  const overlay = asOverlay<DialogContentProps>();
  overlay.configure({
    closeOnEscape: true,
    closeOnOutsidePress: false,
    closeOnFocusOutside: false,
    restore: 'trigger',
    entry: 'content',
    placement: 'center' as any,
    portal: true,
    modal: false,
    layerRole: 'dialog-content',
  });
  const boundary = asBoundary();
  boundary.observe('pointer.press');

  const focusScope = asFocusScope<DialogContentProps>();
  focusScope.configure({ trap: true, loop: true });

  const transition = asTransition();
  overlay.bindPresence({
    enter: transition.controls.enter,
    leave: transition.controls.leave,
    present: transition.isPresent,
  });

  const open = def.state.bool('open', false);
  def.expose.state('open', open);

  let mountedRun: any = null;

  const updateOpen = (
    nextOpen: boolean,
    reason?: string,
    options?: { focusReason?: DialogOpenFocusReason | null }
  ) => {
    const prevOpen = open.get();
    open.set(nextOpen, reason ?? 'reason: dialog content sync => open');
    if (nextOpen) {
      overlay.openOverlay(reason ?? 'dialog.open');
    } else {
      overlay.close(reason ?? 'dialog.close');
    }
    // Context remains live while the L1 view is detached. Structural intent
    // is driven by Transition below, but overlay/focus effects require a
    // mounted view and must not be consumed early by the retained instance.
    if (!mountedRun) return;
    if (nextOpen) {
      if (!prevOpen || !focusScope.isActive()) {
        focusScope.activate({ reason: options?.focusReason ?? 'programmatic' });
      }
    } else {
      if (prevOpen) focusScope.deactivate({ reason: options?.focusReason ?? 'programmatic' });
    }
  };

  const syncAlert = (run: any) => {
    const alert = !!run.props.get().alert;
    alertProp.set(alert, 'reason: dialog alert sync');
  };

  def.context.subscribe(DIALOG_CONTEXT, (run, next) => {
    syncAlert(run);
    updateOpen(next.open, 'reason: dialog context sync => content', {
      focusReason: next.open ? next.openFocusReason : next.returnFocusReason,
    });
  });

  def.lifecycle.onCreated((run) => {
    syncAlert(run);
    const ctx = run.context.read(DIALOG_CONTEXT);
    updateOpen(ctx.open, 'reason: lifecycle.onCreated => dialog content open sync', {
      focusReason: ctx.open ? ctx.openFocusReason : ctx.returnFocusReason,
    });
  });

  def.lifecycle.onMounted((run) => {
    mountedRun = run;
    syncAlert(run);
    const ctx = run.context.read(DIALOG_CONTEXT);
    updateOpen(ctx.open, 'reason: lifecycle.onMounted => dialog content open sync', {
      focusReason: ctx.open ? ctx.openFocusReason : ctx.returnFocusReason,
    });
  });

  def.lifecycle.onUnmounted(() => {
    mountedRun = null;
  });

  overlay.open.watch((_ctx, event) => {
    if (event.type !== 'next') return;
    if (!event.next) {
      const run = mountedRun;
      if (!run) return;
      const ctx = run.context.read(DIALOG_CONTEXT);
      const returnFocusReason: DialogOpenFocusReason | null =
        event.reason === 'escape' ? 'keyboard' : null;
      if (returnFocusReason) focusScope.deactivate({ reason: returnFocusReason });
      if (ctx.controlled) return;
      run.context.update(DIALOG_CONTEXT, (prev: any) => ({
        ...prev,
        open: false,
        openFocusReason: null,
        returnFocusReason,
      }));
    }
  });

  boundary.subscribeOutside(() => {
    if (!overlay.isOpen()) return;
    const returnFocusReason: DialogOpenFocusReason = 'pointer';
    const run = mountedRun;
    if (!run) return;
    const ctx = run.context.read(DIALOG_CONTEXT);
    if (!ctx.open) return;
    if (alertProp.get()) return;

    if (ctx.controlled) {
      focusScope.deactivate({ reason: returnFocusReason });
      overlay.close('outside.press');
      return;
    }
    run.context.update(DIALOG_CONTEXT, (prev: any) => ({
      ...prev,
      open: false,
      openFocusReason: null,
      returnFocusReason,
    }));
  });

  def.rule({
    when: (w) => w.state(transition.isPresent).eq(false),
    intent: (i) => i.feedback.style.use(tw('hidden')),
  });
}

export const asDialogContent = defineAsHook<
  DialogContentProps,
  DialogContentExposes,
  DialogContentAsHookContract,
  DialogContentHandles
>({
  name: 'as-dialog-content',
  setup: setupDialogContent,
  projectHandle: projectDialogContentHandle,
});

const dialogContent = definePrototype({
  name: 'base-dialog-content',
  setup(def) {
    setupDialogContent(def);
    def.feedback.style.use(tw('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'));
  },
});

export default dialogContent;
