import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { asFocusable } from '@proto.ui/hooks';
import { asButton } from '../button';
import { CHECKBOX_CONTEXT, CHECKBOX_FAMILY } from './shared';
import type { CheckboxRootAsHookContract, CheckboxRootExposes, CheckboxRootProps } from './types';

function getKeyboardEventFromProtoEvent(ev: unknown): KeyboardEvent | null {
  const detail = (ev as CustomEvent | undefined)?.detail ?? ev;
  if (detail instanceof KeyboardEvent) return detail;
  if (!detail || typeof detail !== 'object') return null;
  const native = (detail as { nativeEvent?: unknown }).nativeEvent;
  return native instanceof KeyboardEvent ? native : null;
}

function isEnterKeyboardCommit(ev: unknown): boolean {
  const native = getKeyboardEventFromProtoEvent(ev);
  return native?.key === 'Enter';
}

function syncHostA11y(
  run: { host?: { get(): unknown } },
  checked: boolean,
  indeterminate: boolean
) {
  const host = run.host?.get?.() as HTMLElement | undefined;
  if (!host) return;
  host.setAttribute('role', 'checkbox');
  host.setAttribute('aria-checked', indeterminate ? 'mixed' : checked ? 'true' : 'false');
}

function setupCheckboxRoot(def: DefHandle<CheckboxRootProps, CheckboxRootExposes>): void {
  def.anatomy.claim(CHECKBOX_FAMILY, { role: 'root' });

  def.props.define({
    checked: { type: 'boolean', empty: 'fallback' },
    defaultChecked: { type: 'boolean', empty: 'fallback' },
    disabled: { type: 'boolean', empty: 'fallback' },
    indeterminate: { type: 'boolean', empty: 'fallback' },
    defaultIndeterminate: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    defaultChecked: false,
    disabled: false,
    defaultIndeterminate: false,
  });

  asButton();
  asFocusable();

  const checked = def.state.fromAccessibility('checked');
  const disabled = def.state.fromInteraction('disabled');
  def.expose.state('checked', checked);
  def.expose.event('checkedChange', { payload: 'json' });
  def.expose.event('indeterminateChange', { payload: 'json' });

  const indeterminate = def.state.bool('indeterminate', false);
  def.expose.state('indeterminate', indeterminate);

  let controlledChecked = false;
  let controlledIndeterminate = false;

  def.context.provide(CHECKBOX_CONTEXT, {
    checked: false,
    indeterminate: false,
    disabled: false,
  });

  const publishContext = (run: any) => {
    run.context.update(CHECKBOX_CONTEXT, {
      checked: !!checked.get(),
      indeterminate: !!indeterminate.get(),
      disabled: !!run.props.get().disabled,
    });
    syncHostA11y(run, !!checked.get(), !!indeterminate.get());
  };

  const emitCheckedChange = (run: any, detail: { checked: boolean; indeterminate: boolean }) => {
    run.expose.emit('checkedChange', detail);
  };

  def.lifecycle.onCreated((run) => {
    controlledChecked = run.props.isProvided('checked');
    controlledIndeterminate = run.props.isProvided('indeterminate');
    checked.set(
      controlledChecked ? !!run.props.get().checked : !!run.props.get().defaultChecked,
      'reason: lifecycle.onCreated => initialize checked'
    );
    indeterminate.set(
      controlledIndeterminate
        ? !!run.props.get().indeterminate
        : !!run.props.get().defaultIndeterminate,
      'reason: lifecycle.onCreated => initialize indeterminate'
    );
    publishContext(run);
  });

  def.lifecycle.onMounted((run) => {
    publishContext(run);
  });

  def.props.watch(['checked'], (run, next) => {
    controlledChecked = run.props.isProvided('checked');
    if (!controlledChecked) return;
    checked.set(!!next.checked, 'reason: props.watch(checked) => controlled sync');
    publishContext(run);
  });

  def.props.watch(['indeterminate', 'disabled'], (run, next) => {
    controlledIndeterminate = run.props.isProvided('indeterminate');
    if (controlledIndeterminate) {
      indeterminate.set(
        !!next.indeterminate,
        'reason: props.watch(indeterminate) => controlled sync'
      );
    }
    publishContext(run);
  });

  checked.watch((run, event) => {
    if (event.type === 'disconnect') return;
    publishContext(run);
  });

  def.event.on('press.commit', (run, ev) => {
    if (disabled.get()) return;
    if (isEnterKeyboardCommit(ev)) return;

    const wasIndeterminate = indeterminate.get();
    if (wasIndeterminate) {
      if (!controlledIndeterminate) {
        indeterminate.set(false, 'reason: press.commit => clear indeterminate');
      }
      run.expose.emit('indeterminateChange', { indeterminate: false });
    }

    const nextChecked = !checked.get();
    const nextIndeterminate = indeterminate.get();

    if (controlledChecked) {
      emitCheckedChange(run, { checked: nextChecked, indeterminate: nextIndeterminate });
      publishContext(run);
      return;
    }

    checked.set(nextChecked, 'reason: press.commit => toggle checked');
    emitCheckedChange(run, { checked: nextChecked, indeterminate: nextIndeterminate });
    publishContext(run);
  });
}

export const asCheckboxRoot = defineAsHook<
  CheckboxRootProps,
  CheckboxRootExposes,
  CheckboxRootAsHookContract
>({
  name: 'as-checkbox-root',
  setup: setupCheckboxRoot,
});

const checkboxRoot = definePrototype({
  name: 'base-checkbox-root',
  setup: setupCheckboxRoot,
});

export default checkboxRoot;
