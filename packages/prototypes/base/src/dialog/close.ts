import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { setupDialogCommand } from './command';
import { DIALOG_CONTEXT, DIALOG_FAMILY, type DialogOpenFocusReason } from './shared';
import type { DialogCloseAsHookContract, DialogCloseExposes, DialogCloseProps } from './types';

function setupDialogClose(def: DefHandle<DialogCloseProps, DialogCloseExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'close' });
  const command = setupDialogCommand(def, 'dialog close');

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
    const returnFocusReason: DialogOpenFocusReason = ev?.detail?.key ? 'keyboard' : 'pointer';
    run.context.update(DIALOG_CONTEXT, (prev) => ({
      ...prev,
      open: false,
      openFocusReason: null,
      returnFocusReason,
    }));
  });
}

export const asDialogClose = defineAsHook<
  DialogCloseProps,
  DialogCloseExposes,
  DialogCloseAsHookContract
>({
  name: 'as-dialog-close',
  setup: setupDialogClose,
});

const dialogClose = definePrototype({
  name: 'base-dialog-close',
  setup: setupDialogClose,
});

export default dialogClose;
