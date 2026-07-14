import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { useOpenState } from '../tools';
import {
  createDialogRootId,
  DIALOG_CONTEXT,
  DIALOG_FAMILY,
  type DialogContextValue,
} from './shared';
import type { DialogRootAsHookContract, DialogRootExposes, DialogRootProps } from './types';

function sameContext(a: DialogContextValue, b: DialogContextValue): boolean {
  return (
    a.rootId === b.rootId &&
    a.open === b.open &&
    a.openFocusReason === b.openFocusReason &&
    a.returnFocusReason === b.returnFocusReason &&
    a.controlled === b.controlled &&
    a.disabled === b.disabled &&
    a.alert === b.alert &&
    a.requestedOpen === b.requestedOpen &&
    a.requestReason === b.requestReason &&
    a.requestFocusReason === b.requestFocusReason &&
    a.requestVersion === b.requestVersion
  );
}

function setupDialogRoot(def: DefHandle<DialogRootProps, DialogRootExposes>): void {
  def.anatomy.claim(DIALOG_FAMILY, { role: 'root' });
  const rootId = createDialogRootId();

  def.props.define({
    open: { type: 'boolean', empty: 'fallback' },
    defaultOpen: { type: 'boolean', empty: 'fallback' },
    disabled: { type: 'boolean', empty: 'fallback' },
    alert: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    defaultOpen: false,
    disabled: false,
    alert: false,
  });

  def.context.provide(DIALOG_CONTEXT, {
    rootId,
    open: false,
    openFocusReason: null,
    returnFocusReason: null,
    controlled: false,
    disabled: false,
    alert: false,
    requestedOpen: false,
    requestReason: null,
    requestFocusReason: null,
    requestVersion: 0,
  });

  const openState = useOpenState({
    exposeOpenMethodKey: 'openDialog',
  });
  const open = openState.getState?.('open');
  def.expose.event('openChange', { payload: 'json' });

  const initialContext: DialogContextValue = {
    rootId,
    open: false,
    openFocusReason: null,
    returnFocusReason: null,
    controlled: false,
    disabled: false,
    alert: false,
    requestedOpen: false,
    requestReason: null,
    requestFocusReason: null,
    requestVersion: 0,
  };
  let snapshot: DialogContextValue = initialContext;
  let published: DialogContextValue = initialContext;
  let lastRequestVersion = 0;

  const syncContext = (run: any) => {
    const next = {
      ...snapshot,
      open: open?.get() ?? false,
    };
    snapshot = next;
    if (sameContext(published, next)) return;
    published = next;
    run.context.update(DIALOG_CONTEXT, next);
  };

  def.context.subscribe(DIALOG_CONTEXT, (run, next) => {
    snapshot = next;
    published = next;
    if (next.requestVersion !== lastRequestVersion) {
      lastRequestVersion = next.requestVersion;
      if (!next.controlled) {
        open?.set(next.requestedOpen, 'reason: dialog open request => uncontrolled sync');
      }
      run.expose.emit('openChange', {
        open: next.requestedOpen,
        reason: next.requestReason,
        focusReason: next.requestFocusReason,
      });
      return;
    }
    if (!snapshot.controlled) {
      open?.set(next.open, 'reason: dialog context sync => open');
    }
  });

  def.lifecycle.onCreated((run) => {
    snapshot = {
      ...snapshot,
      controlled: run.props.isProvided('open'),
      disabled: !!run.props.get().disabled,
      alert: !!run.props.get().alert,
    };
    syncContext(run);
  });

  def.props.watch(['open', 'disabled', 'alert'], (run, next) => {
    snapshot = {
      ...snapshot,
      controlled: run.props.isProvided('open'),
      disabled: !!next.disabled,
      alert: !!next.alert,
    };
    syncContext(run);
  });

  open?.watch((run, event) => {
    if (event.type !== 'next') return;
    syncContext(run);
  });
}

export const asDialogRoot = defineAsHook<
  DialogRootProps,
  DialogRootExposes,
  DialogRootAsHookContract
>({
  name: 'as-dialog-root',
  setup: setupDialogRoot,
});

const dialogRoot = definePrototype({
  name: 'base-dialog-root',
  setup(def) {
    setupDialogRoot(def);
  },
});

export default dialogRoot;
