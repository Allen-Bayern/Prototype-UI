import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asBoundary, asFocusScope, asOverlay } from '@proto.ui/hooks';
import { asTransition } from '../tools';
import {
  DIALOG_CONTEXT,
  DIALOG_FAMILY,
  createDialogPartId,
  requestDialogOpen,
  type DialogContextValue,
  type DialogOpenFocusReason,
} from './shared';
import type {
  DialogContentAsHookContract,
  DialogContentExposes,
  DialogContentHandles,
  DialogContentProps,
} from './types';

function projectDialogContentHandle(
  result: import('@proto.ui/core').AsHookResult<DialogContentProps, DialogContentAsHookContract>
): DialogContentHandles {
  const open = result.getState?.('open');
  const asTransition = result.getAsHookHandle?.('asTransition');
  if (!open || !asTransition) {
    throw new Error('[as-dialog-content] missing captured Dialog or Transition handles.');
  }
  return { stateHandles: { open }, asTransition };
}

function setupDialogContent(def: DefHandle<DialogContentProps, DialogContentExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'content' });

  const alertProp = def.state.bool('alert', false);
  const role = def.state.string('dialogRole', 'dialog', {
    options: ['dialog', 'alertdialog'],
  });
  const modal = def.state.bool('dialogModal', true);
  const contentId = def.state.string('dialogContentId', '');
  const titleId = def.state.string('dialogTitleId', '');
  const descriptionId = def.state.string('dialogDescriptionId', '');
  def.a11y.id(contentId);
  def.a11y.role(role);
  def.a11y.state('modal', modal);
  def.a11y.relation('labelledBy', { target: titleId });
  def.a11y.relation('describedBy', { target: descriptionId });

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
  let currentContext: DialogContextValue | null = null;

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

  const syncIdentity = (ctx: DialogContextValue) => {
    contentId.set(createDialogPartId(ctx.rootId, 'content'), 'reason: dialog content id sync');
    titleId.set(createDialogPartId(ctx.rootId, 'title'), 'reason: dialog title relation sync');
    descriptionId.set(
      createDialogPartId(ctx.rootId, 'description'),
      'reason: dialog description relation sync'
    );
  };

  const syncAlert = (ctx: DialogContextValue) => {
    const alert = ctx.alert;
    alertProp.set(alert, 'reason: dialog alert sync');
    role.set(alert ? 'alertdialog' : 'dialog', 'reason: dialog semantic role sync');
  };

  def.context.subscribe(DIALOG_CONTEXT, (run, next) => {
    currentContext = next;
    syncIdentity(next);
    syncAlert(next);
    updateOpen(next.open, 'reason: dialog context sync => content', {
      focusReason: next.open ? next.openFocusReason : next.returnFocusReason,
    });
  });

  def.lifecycle.onCreated((run) => {
    const ctx = run.context.read(DIALOG_CONTEXT);
    currentContext = ctx;
    syncIdentity(ctx);
    syncAlert(ctx);
    updateOpen(ctx.open, 'reason: lifecycle.onCreated => dialog content open sync', {
      focusReason: ctx.open ? ctx.openFocusReason : ctx.returnFocusReason,
    });
  });

  def.lifecycle.onMounted((run) => {
    mountedRun = run;
    const ctx = run.context.read(DIALOG_CONTEXT);
    currentContext = ctx;
    syncIdentity(ctx);
    syncAlert(ctx);
    updateOpen(ctx.open, 'reason: lifecycle.onMounted => dialog content open sync', {
      focusReason: ctx.open ? ctx.openFocusReason : ctx.returnFocusReason,
    });
  });

  def.lifecycle.onUnmounted(() => {
    mountedRun = null;
    currentContext = null;
  });

  overlay.open.watch((_ctx, event) => {
    if (event.type !== 'next' || event.next || event.reason !== 'escape') return;
    const run = mountedRun;
    if (!run) return;
    const ctx = currentContext;
    if (!ctx) return;
    if (!ctx.open) return;
    requestDialogOpen(run, false, 'escape', 'keyboard');
    if (ctx.controlled) overlay.openOverlay('controlled.sync');
  });

  boundary.subscribeOutside(() => {
    if (!overlay.isOpen()) return;
    const returnFocusReason: DialogOpenFocusReason = 'pointer';
    const run = mountedRun;
    if (!run) return;
    const ctx = currentContext;
    if (!ctx) return;
    if (!ctx.open) return;
    if (alertProp.get()) return;

    requestDialogOpen(run, false, 'outside.press', returnFocusReason);
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
