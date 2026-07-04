import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { asFocusable, asTrigger } from '@proto.ui/hooks';
import { SWITCH_CONTEXT, SWITCH_FAMILY } from './shared';
import type { SwitchRootAsHookContract, SwitchRootExposes, SwitchRootProps } from './types';

function setupSwitchRoot(def: DefHandle<SwitchRootProps, SwitchRootExposes>): void {
  def.anatomy.claim(SWITCH_FAMILY, { role: 'root' });

  asTrigger();

  def.props.define({
    checked: { type: 'boolean', empty: 'fallback' },
    defaultChecked: { type: 'boolean', empty: 'fallback' },
    disabled: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    defaultChecked: false,
    disabled: false,
  });

  const checked = def.state.fromAccessibility('checked');
  const disabled = def.state.fromInteraction('disabled');
  const hovered = def.state.fromInteraction('hovered');
  const pressed = def.state.fromInteraction('pressed');
  const focusable = asFocusable<SwitchRootProps>();
  focusable.configure({ disabled: false });

  const focused = focusable.focused;
  const focusVisible = focusable.focusVisible;

  def.expose.state('checked', checked);
  def.expose.state('disabled', disabled);
  def.expose.state('hovered', hovered);
  def.expose.state('focused', focused);
  def.expose.state('focusVisible', focusVisible);
  def.expose.state('pressed', pressed);
  def.expose.method('focusSelf', (options) => {
    if (disabled.get()) return;
    focusable.focusSelf(options);
  });
  def.expose.event('checkedChange', { payload: 'json' });

  def.a11y.role('switch');
  def.a11y.nameFromContent();
  def.a11y.state('checked', checked);
  def.a11y.state('disabled', disabled);
  def.a11y.action('activate', { event: 'checkedChange' });

  def.context.provide(SWITCH_CONTEXT, {
    checked: false,
    disabled: false,
  });

  let controlled = false;

  const publishContext = (run: any) => {
    run.context.update(SWITCH_CONTEXT, {
      checked: !!checked.get(),
      disabled: !!disabled.get(),
    });
  };

  const syncDisabled = (run: any, nextDisabled: boolean) => {
    disabled.set(nextDisabled, 'reason: switch root sync disabled');
    focusable.setDisabled(nextDisabled);
    publishContext(run);
  };

  def.lifecycle.onCreated((run) => {
    controlled = run.props.isProvided('checked');
    checked.set(
      controlled ? !!run.props.get().checked : !!run.props.get().defaultChecked,
      'reason: switch root initialize checked'
    );
    syncDisabled(run, !!run.props.get().disabled);
    publishContext(run);
  });

  def.lifecycle.onMounted((run) => {
    publishContext(run);
  });

  def.props.watch(['checked'], (run, next) => {
    controlled = run.props.isProvided('checked');
    if (!controlled) return;
    checked.set(!!next.checked, 'reason: switch root controlled checked sync');
    publishContext(run);
  });

  def.props.watch(['disabled'], (run, next) => {
    syncDisabled(run, !!next.disabled);
  });

  checked.watch((run, event) => {
    if (event.type === 'disconnect') return;
    publishContext(run);
  });

  disabled.watch((run, event) => {
    if (event.type === 'disconnect') return;
    publishContext(run);
  });

  def.event.onGlobal('key.down', (_run, ev) => {
    const detail = ev?.detail;
    if (disabled.get()) return;
    if (!focused.get()) return;
    if (detail?.key !== ' ') return;
    detail?.preventDefault?.();
  });

  def.event.on('press.commit', (run) => {
    if (disabled.get()) return;

    const nextChecked = !checked.get();
    if (!controlled) {
      checked.set(nextChecked, 'reason: switch root press.commit => checked');
    }
    run.expose.emit('checkedChange', { checked: nextChecked });
    publishContext(run);
  });
}

export const asSwitchRoot = defineAsHook<
  SwitchRootProps,
  SwitchRootExposes,
  SwitchRootAsHookContract
>({
  name: 'as-switch-root',
  setup: setupSwitchRoot,
});

const switchRoot = definePrototype({
  name: 'base-switch-root',
  setup: setupSwitchRoot,
});

export default switchRoot;
