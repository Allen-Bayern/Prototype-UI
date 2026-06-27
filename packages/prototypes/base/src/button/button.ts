import type { DefHandle } from '@proto.ui/core';
import { defineAsHook, definePrototype } from '@proto.ui/core';
import { asFocusable, asTrigger } from '@proto.ui/hooks';
import type { ButtonAsHookContract, ButtonExposes, ButtonProps, ButtonStateHandles } from './types';

export type { ButtonProps, ButtonExposes, ButtonStateHandles, ButtonAsHookContract } from './types';

function setupButton(def: DefHandle<ButtonProps, ButtonExposes>): void {
  asTrigger();

  def.props.define({
    disabled: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    disabled: false,
  });

  const disabled = def.state.fromInteraction('disabled');
  def.expose.state('disabled', disabled);
  const focusable = asFocusable<ButtonProps>();
  focusable.configure({ disabled: false });
  const hovered = def.state.fromInteraction('hovered');
  const focused = focusable.focused;
  const focusVisible = focusable.focusVisible;
  const legacyFocused = def.state.fromInteraction('focused');
  const legacyFocusVisible = def.state.fromInteraction('focusVisible');
  const pressed = def.state.fromInteraction('pressed');

  const syncDisabled = (nextDisabled: boolean) => {
    disabled.set(nextDisabled, 'reason: sync disabled');
    focusable.setDisabled(nextDisabled);
  };

  def.lifecycle.onCreated((run) => {
    syncDisabled(!!run.props.get().disabled);
  });

  def.props.watch(['disabled'], (_run, next) => {
    syncDisabled(!!next.disabled);
  });

  def.expose.state('hovered', hovered);

  focusable.focused.watch((_run, event) => {
    if (event.type !== 'next') return;
    legacyFocused.set(event.next, 'reason: asButton focus projection => focused');
  });
  focusable.focusVisible.watch((_run, event) => {
    if (event.type !== 'next') return;
    legacyFocusVisible.set(event.next, 'reason: asButton focus projection => focusVisible');
  });
  def.expose.state('focused', focused);
  def.expose.state('focusVisible', focusVisible);
  def.expose.method('focusSelf', (options) => {
    if (disabled.get()) return;
    focusable.focusSelf(options);
  });

  def.expose.state('pressed', pressed);

  def.expose.event('click', { payload: 'void' });
  def.event.onGlobal('key.down', (_run, ev) => {
    const detail = ev?.detail;
    if (disabled.get()) return;
    if (!focused.get()) return;
    if (detail?.key !== ' ') return;
    detail?.preventDefault?.();
  });

  def.event.on('press.commit', (run) => {
    if (disabled.get()) return;
    run.expose.emit('click');
  });
}

export const asButton = defineAsHook<ButtonProps, ButtonExposes, ButtonAsHookContract>({
  name: 'as-button',
  setup: setupButton,
});

const button = definePrototype({
  name: 'base-button',
  setup: setupButton,
});

export default button;
