import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { setupDialogCommand } from './command';
import { DIALOG_CONTEXT, DIALOG_FAMILY, type DialogOpenFocusReason } from './shared';
import type {
  DialogTriggerAsHookContract,
  DialogTriggerExposes,
  DialogTriggerProps,
} from './types';

function setupDialogTrigger(def: DefHandle<DialogTriggerProps, DialogTriggerExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'trigger' });
  const command = setupDialogCommand(def, 'dialog trigger');

  def.context.subscribe(DIALOG_CONTEXT, (run, next) => {
    command.syncDisabled(!!run.props.get().disabled || next.disabled);
  });

  def.lifecycle.onCreated((run) => {
    command.syncDisabled(!!run.props.get().disabled || run.context.read(DIALOG_CONTEXT).disabled);
  });

  def.props.watch(['disabled'], (run, next) => {
    command.syncDisabled(!!next.disabled || run.context.read(DIALOG_CONTEXT).disabled);
  });

  def.event.on('press.commit', (run, ev) => {
    const ctx = run.context.read(DIALOG_CONTEXT);
    if (command.disabled.get()) return;
    if (ctx.controlled) return;
    const openFocusReason: DialogOpenFocusReason = ev?.detail?.key ? 'keyboard' : 'pointer';
    run.context.update(DIALOG_CONTEXT, (prev) => ({
      ...prev,
      open: !prev.open,
      openFocusReason: prev.open ? null : openFocusReason,
      returnFocusReason: prev.open ? openFocusReason : null,
    }));
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
