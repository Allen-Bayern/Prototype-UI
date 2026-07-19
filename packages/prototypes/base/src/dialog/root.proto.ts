import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { useOpenState } from '../tools';
import {
  createDialogRootId,
  DIALOG_CONTEXT,
  DIALOG_FAMILY,
  requestDialogOpen,
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
    a.a11yLabel === b.a11yLabel &&
    a.requestedOpen === b.requestedOpen &&
    a.requestReason === b.requestReason &&
    a.requestFocusReason === b.requestFocusReason &&
    a.requestVersion === b.requestVersion
  );
}

function setupDialogRoot(def: DefHandle<DialogRootProps, DialogRootExposes>): void {
  // P-BASE-DIALOG-ROLE-MODAL-WINDOW, P-BASE-DIALOG-ROOT-OWNER
  def.anatomy.claim(DIALOG_FAMILY, { role: 'root' });
  const rootId = createDialogRootId();

  // P-BASE-DIALOG-PROPS
  def.props.define({
    open: { type: 'boolean', empty: 'fallback' },
    defaultOpen: { type: 'boolean', empty: 'fallback' },
    disabled: { type: 'boolean', empty: 'fallback' },
    alert: { type: 'boolean', empty: 'fallback' },
    a11yLabel: { type: 'string', empty: 'fallback' },
  });
  def.props.setDefaults({
    defaultOpen: false,
    disabled: false,
    alert: false,
    a11yLabel: '',
  });

  // P-BASE-DIALOG-CONTEXT
  def.context.provide(DIALOG_CONTEXT, {
    rootId,
    open: false,
    openFocusReason: null,
    returnFocusReason: null,
    controlled: false,
    disabled: false,
    alert: false,
    a11yLabel: '',
    requestedOpen: false,
    requestReason: null,
    requestFocusReason: null,
    requestVersion: 0,
  });

  // P-BASE-DIALOG-OPEN-EXPOSE, P-BASE-DIALOG-CONTROLLED-OWNER
  const openState = useOpenState({
    exposeOpenMethodKey: 'openDialog',
    requestOpen(run, nextOpen, reason) {
      const ctx = run.context.read(DIALOG_CONTEXT);
      if (ctx.disabled) return;
      requestDialogOpen(run, nextOpen, reason, 'programmatic');
    },
  });
  const open = openState.getState?.('open');
  // P-BASE-DIALOG-OPEN-CHANGE
  def.expose.event('openChange', { payload: 'json' });

  const initialContext: DialogContextValue = {
    rootId,
    open: false,
    openFocusReason: null,
    returnFocusReason: null,
    controlled: false,
    disabled: false,
    alert: false,
    a11yLabel: '',
    requestedOpen: false,
    requestReason: null,
    requestFocusReason: null,
    requestVersion: 0,
  };
  let snapshot: DialogContextValue = initialContext;
  let published: DialogContextValue = initialContext;
  let lastRequestVersion = 0;

  const syncContext = (run: any) => {
    // P-BASE-DIALOG-CONTEXT
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
    // P-BASE-DIALOG-OPEN-CHANGE, P-BASE-DIALOG-CONTROLLED-OWNER
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
    // P-BASE-DIALOG-ROOT-OWNER, P-BASE-DIALOG-PROPS
    snapshot = {
      ...snapshot,
      controlled: run.props.isProvided('open'),
      disabled: !!run.props.get().disabled,
      alert: !!run.props.get().alert,
      a11yLabel: run.props.get().a11yLabel ?? '',
    };
    syncContext(run);
  });

  def.props.watch(['open', 'disabled', 'alert', 'a11yLabel'], (run, next) => {
    snapshot = {
      ...snapshot,
      controlled: run.props.isProvided('open'),
      disabled: !!next.disabled,
      alert: !!next.alert,
      a11yLabel: next.a11yLabel ?? '',
    };
    syncContext(run);
  });

  open?.watch((run, event) => {
    if (event.type !== 'next') return;
    syncContext(run);
  });
}

/*
 * P-BASE-DIALOG-PROTOCOL-INDEPENDENCE: Root consumes a protocol-neutral useOpenState helper,
 * not another Base prototype-specific authored asHook.
 */

// P-BASE-DIALOG-AUTHORING-ENTRIES
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
