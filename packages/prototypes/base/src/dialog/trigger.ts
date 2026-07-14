import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { setupDialogCommand } from './command';
import {
  createDialogPartId,
  DIALOG_CONTEXT,
  DIALOG_FAMILY,
  requestDialogOpen,
  type DialogContextValue,
  type DialogOpenFocusReason,
} from './shared';
import type {
  DialogTriggerAsHookContract,
  DialogTriggerExposes,
  DialogTriggerProps,
} from './types';

function setupDialogTrigger(def: DefHandle<DialogTriggerProps, DialogTriggerExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'trigger' });
  const command = setupDialogCommand(def, 'dialog trigger');
  const expanded = def.state.bool('dialogExpanded', false);
  const hasPopup = def.state.string('dialogHasPopup', 'dialog');
  const controls = def.state.string('dialogContentId', '');
  def.a11y.state('expanded', expanded);
  def.a11y.state('hasPopup', hasPopup);
  def.a11y.relation('controls', { target: controls });

  const syncDialogFacts = (ctx: DialogContextValue) => {
    expanded.set(ctx.open, 'reason: dialog trigger expanded sync');
    controls.set(createDialogPartId(ctx.rootId, 'content'), 'reason: dialog trigger controls sync');
  };

  def.context.subscribe(DIALOG_CONTEXT, (run, next) => {
    command.syncDisabled(!!run.props.get().disabled || next.disabled);
    syncDialogFacts(next);
  });

  def.lifecycle.onCreated((run) => {
    const ctx = run.context.read(DIALOG_CONTEXT);
    command.syncDisabled(!!run.props.get().disabled || ctx.disabled);
    syncDialogFacts(ctx);
  });

  def.props.watch(['disabled'], (run, next) => {
    command.syncDisabled(!!next.disabled || run.context.read(DIALOG_CONTEXT).disabled);
  });

  def.event.on('press.commit', (run, ev) => {
    const ctx = run.context.read(DIALOG_CONTEXT);
    if (command.disabled.get()) return;
    const openFocusReason: DialogOpenFocusReason = ev?.detail?.key ? 'keyboard' : 'pointer';
    requestDialogOpen(run, !ctx.open, 'trigger.press', openFocusReason);
  });
}

export const asDialogTrigger = defineAsHook<
  DialogTriggerProps,
  DialogTriggerExposes,
  DialogTriggerAsHookContract
>({
  name: 'as-dialog-trigger',
  setup: setupDialogTrigger,
});

const dialogTrigger = definePrototype({
  name: 'base-dialog-trigger',
  setup: setupDialogTrigger,
});

export default dialogTrigger;
