import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asHitParticipation, asOverlay } from '@proto.ui/hooks';
import { asTransition } from '../tools';
import { DIALOG_CONTEXT, DIALOG_FAMILY } from './shared';
import type {
  DialogMaskAsHookContract,
  DialogMaskExposes,
  DialogMaskHandles,
  DialogMaskProps,
} from './types';

function projectDialogMaskHandle(
  result: import('@proto.ui/core').AsHookResult<DialogMaskProps, DialogMaskAsHookContract>
): DialogMaskHandles {
  const open = result.getState?.('open');
  const asTransition = result.getAsHookHandle?.('asTransition');
  if (!open || !asTransition) {
    throw new Error('[as-dialog-mask] missing captured Dialog or Transition handles.');
  }
  return { stateHandles: { open }, asTransition };
}

function setupDialogMask(def: DefHandle<DialogMaskProps, DialogMaskExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'mask' });
  def.props.define({
    passthrough: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    passthrough: false,
  });

  const overlay = asOverlay<DialogMaskProps>();
  overlay.configure({
    closeOnEscape: false,
    closeOnOutsidePress: false,
    closeOnFocusOutside: false,
    portal: true,
    modal: true,
    layerRole: 'dialog-mask',
  });
  const hitParticipation = asHitParticipation({
    debugLabel: 'dialog-mask',
    meta: {
      overlayKind: 'dialog-mask',
    },
  });

  const transition = asTransition();
  overlay.bindPresence({
    enter: transition.controls.enter,
    leave: transition.controls.leave,
    present: transition.isPresent,
  });
  const open = def.state.bool('open', false);
  let hitRegionDispose: (() => void) | null = null;
  let hitSyncDisposed = false;

  const syncHitParticipation = (run: any) => {
    if (hitSyncDisposed) return;

    const target = run.host?.get?.() ?? null;

    hitRegionDispose?.();
    hitRegionDispose = null;

    if (!target) return;

    hitRegionDispose = hitParticipation.registerRegion(target, {
      role: 'mask',
      mode: run.props.get().passthrough ? 'passthrough' : 'participating',
      meta: {
        overlayKind: 'dialog-mask',
      },
    });
  };

  const updateOpen = (nextOpen: boolean, reason?: string) => {
    open.set(nextOpen, reason ?? 'reason: dialog mask sync => open');
    if (nextOpen) {
      overlay.openOverlay(reason ?? 'dialog.open');
    } else {
      overlay.close(reason ?? 'dialog.close');
    }
  };

  def.context.subscribe(DIALOG_CONTEXT, (_run, next) => {
    updateOpen(next.open, 'reason: dialog context sync => mask open');
  });

  def.props.watch(['passthrough'], (run) => {
    syncHitParticipation(run);
  });

  def.lifecycle.onCreated((run) => {
    const ctx = run.context.read(DIALOG_CONTEXT);
    updateOpen(ctx.open, 'reason: lifecycle.onCreated => dialog mask open sync');
  });

  def.lifecycle.onMounted((run) => {
    hitSyncDisposed = false;
    syncHitParticipation(run);
    queueMicrotask(() => {
      if (hitSyncDisposed) return;
      syncHitParticipation(run);
    });
    updateOpen(open.get(), 'reason: lifecycle.onMounted => dialog mask open sync');
  });

  def.lifecycle.onUnmounted(() => {
    hitSyncDisposed = true;
    hitRegionDispose?.();
    hitRegionDispose = null;
  });

  def.rule({
    when: (w) => w.state(transition.isPresent).eq(false),
    intent: (i) => i.feedback.style.use(tw('hidden')),
  });
}

export const asDialogMask = defineAsHook<
  DialogMaskProps,
  DialogMaskExposes,
  DialogMaskAsHookContract,
  DialogMaskHandles
>({
  name: 'as-dialog-mask',
  setup: setupDialogMask,
  projectHandle: projectDialogMaskHandle,
});

const dialogMask = definePrototype({
  name: 'base-dialog-mask',
  setup(def) {
    setupDialogMask(def);
    def.feedback.style.use(tw('fixed inset-0'));
  },
});

export default dialogMask;
