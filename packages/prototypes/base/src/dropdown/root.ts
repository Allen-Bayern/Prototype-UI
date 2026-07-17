import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { asCollection } from '@proto.ui/hooks';
import { useOpenState } from '../tools';
import {
  createDropdownRootId,
  DROPDOWN_CONTEXT,
  DROPDOWN_FAMILY,
  type DropdownContextValue,
  type DropdownOpenRequest,
} from './shared';
import type { DropdownRootAsHookContract, DropdownRootExposes, DropdownRootProps } from './types';

function sameContext(a: DropdownContextValue, b: DropdownContextValue): boolean {
  return Object.keys(a).every(
    (key) => a[key as keyof DropdownContextValue] === b[key as keyof DropdownContextValue]
  );
}

function setupDropdownRoot(def: DefHandle<DropdownRootProps, DropdownRootExposes>): void {
  // P-BASE-DROPDOWN-MENU-ROOT-OWNER
  def.anatomy.claim(DROPDOWN_FAMILY, { role: 'root' });
  const collection = asCollection();
  collection.configure({ family: DROPDOWN_FAMILY });

  // P-BASE-DROPDOWN-MENU-PROPS
  def.props.define({
    open: { type: 'boolean', empty: 'fallback' },
    defaultOpen: { type: 'boolean', empty: 'fallback' },
    disabled: { type: 'boolean', empty: 'fallback' },
    closeOnItemCommit: { type: 'boolean', empty: 'fallback' },
    openEntry: { type: 'string', empty: 'fallback' },
    openEntryValue: { type: 'string', empty: 'fallback' },
  });
  def.props.setDefaults({
    defaultOpen: false,
    disabled: false,
    closeOnItemCommit: true,
    openEntry: 'active-or-first',
    openEntryValue: '',
  });

  const initialContext: DropdownContextValue = {
    rootId: '',
    open: false,
    controlled: false,
    disabled: false,
    activeValue: '',
    closeOnItemCommit: true,
    openEntry: 'active-or-first',
    openEntryValue: '',
    requestReason: null,
    requestFocusReason: null,
    requestEntry: null,
  };
  // P-BASE-DROPDOWN-MENU-CONTEXT
  def.context.provide(DROPDOWN_CONTEXT, initialContext);

  // P-BASE-DROPDOWN-MENU-REQUESTS
  let submitRequest = (_run: any, _request: DropdownOpenRequest): boolean => false;
  const openState = useOpenState({
    requestOpen(run, nextOpen, reason) {
      submitRequest(run, {
        open: nextOpen,
        reason,
        focusReason: 'programmatic',
      });
    },
  });
  const open = openState.getState?.('open');
  def.expose.event('openChange', { payload: 'json' });

  let snapshot = initialContext;
  let published = initialContext;
  let currentRun: any = null;

  const syncContext = (run: any) => {
    const next = { ...snapshot, open: open?.get() ?? false };
    snapshot = next;
    if (sameContext(published, next)) return;
    published = next;
    run.context.update(DROPDOWN_CONTEXT, next);
  };

  def.context.subscribe(DROPDOWN_CONTEXT, (run, next) => {
    snapshot = next;
    published = next;
  });

  submitRequest = (run, request) => {
    if (snapshot.disabled) return false;
    snapshot = {
      ...snapshot,
      activeValue: request.open || snapshot.controlled ? snapshot.activeValue : '',
      requestReason: request.reason,
      requestFocusReason: request.focusReason,
      requestEntry: request.open ? (request.entry ?? null) : null,
    };
    if (!snapshot.controlled) {
      open?.set(request.open, 'reason: dropdown root accepted request');
    }
    syncContext(run);
    run.expose.emit('openChange', {
      open: request.open,
      reason: request.reason,
      focusReason: request.focusReason,
    });
    return true;
  };

  def.expose.method('requestOpen', (request) => {
    if (!currentRun) return false;
    return submitRequest(currentRun, request);
  });

  def.lifecycle.onCreated((run) => {
    currentRun = run;
    const props = run.props.get();
    snapshot = {
      ...snapshot,
      rootId: createDropdownRootId(),
      controlled: run.props.isProvided('open'),
      disabled: !!props.disabled,
      closeOnItemCommit: props.closeOnItemCommit !== false,
      openEntry: (props.openEntry as DropdownRootProps['openEntry']) ?? 'active-or-first',
      openEntryValue: props.openEntryValue ?? '',
    };
    syncContext(run);
  });

  def.lifecycle.onMounted((run) => {
    currentRun = run;
  });

  def.lifecycle.onUnmounted(() => {
    currentRun = null;
  });

  def.props.watch(
    ['open', 'disabled', 'closeOnItemCommit', 'openEntry', 'openEntryValue'],
    (run, next) => {
      snapshot = {
        ...snapshot,
        controlled: run.props.isProvided('open'),
        disabled: !!next.disabled,
        closeOnItemCommit: next.closeOnItemCommit !== false,
        openEntry: (next.openEntry as DropdownRootProps['openEntry']) ?? 'active-or-first',
        openEntryValue: next.openEntryValue ?? '',
      };
      syncContext(run);
    }
  );

  open?.watch((run, event) => {
    if (event.type !== 'next') return;
    if (!event.next) snapshot = { ...snapshot, activeValue: '', requestEntry: null };
    syncContext(run);
  });
}

// P-BASE-DROPDOWN-MENU-AUTHORING-ENTRIES
export const asDropdownRoot = defineAsHook<
  DropdownRootProps,
  DropdownRootExposes,
  DropdownRootAsHookContract
>({
  name: 'as-dropdown-root',
  setup: setupDropdownRoot,
});

const dropdownRoot = definePrototype({
  name: 'base-dropdown-root',
  setup: setupDropdownRoot,
});

export default dropdownRoot;
