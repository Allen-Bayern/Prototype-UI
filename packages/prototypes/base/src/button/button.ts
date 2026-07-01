import type { DefHandle } from '@proto.ui/core';
import { defineAsHook, definePrototype } from '@proto.ui/core';
import { asFocusable, asTrigger } from '@proto.ui/hooks';
import type { ButtonAsHookContract, ButtonExposes, ButtonProps, ButtonStateHandles } from './types';

export type { ButtonProps, ButtonExposes, ButtonStateHandles, ButtonAsHookContract } from './types';

function setupButton(def: DefHandle<ButtonProps, ButtonExposes>): void {
  // P-BASE-BUTTON-TRIGGER-SEMANTICS, P-BASE-BUTTON-NESTED-TRIGGER-ROUTE
  asTrigger();

  // P-BASE-BUTTON-PROP-DISABLED
  def.props.define({
    disabled: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    disabled: false,
  });

  // P-BASE-BUTTON-DISABLED-EXPOSE
  const disabled = def.state.fromInteraction('disabled');
  def.expose.state('disabled', disabled);

  // P-BASE-BUTTON-POINTER-HOVER
  const hovered = def.state.fromInteraction('hovered');
  def.expose.state('hovered', hovered);

  // P-BASE-BUTTON-FOCUSABLE, P-BASE-BUTTON-DISABLED-REJECT-FOCUS
  const focusable = asFocusable<ButtonProps>();
  focusable.configure({ disabled: false });

  const focused = focusable.focused;
  const focusVisible = focusable.focusVisible;

  // P-BASE-BUTTON-FOCUSABLE
  def.expose.state('focused', focused);
  def.expose.state('focusVisible', focusVisible);

  // P-BASE-BUTTON-REQUEST-FOCUS, P-BASE-BUTTON-DISABLED-REJECT-FOCUS
  def.expose.method('focusSelf', (options) => {
    if (disabled.get()) return;
    focusable.focusSelf(options);
  });

  // P-BASE-BUTTON-PRESS-LIFECYCLE
  const pressed = def.state.fromInteraction('pressed');
  def.expose.state('pressed', pressed);

  // P-BASE-BUTTON-PROP-DISABLED-CONTROLLED, P-BASE-BUTTON-DISABLED-CLEAR-TRANSIENT
  const syncDisabled = (nextDisabled: boolean) => {
    disabled.set(nextDisabled, 'reason: sync disabled');
    focusable.setDisabled(nextDisabled);
  };
  def.lifecycle.onCreated((run) => {
    syncDisabled(run.props.get().disabled);
  });
  def.props.watch(['disabled'], (_run, next) => {
    syncDisabled(next.disabled);
  });

  // P-BASE-BUTTON-CLICK-SIGNAL, P-BASE-BUTTON-CLICK-PROTOCOL-NAME
  def.expose.event('click', { payload: 'void' });

  // P-BASE-BUTTON-KEYBOARD-ACTIVATION, P-BASE-BUTTON-KEYBOARD-SPACE-PREVENT-DEFAULT
  def.event.onGlobal('key.down', (_run, ev) => {
    const detail = ev?.detail;
    if (disabled.get()) return;
    if (!focused.get()) return;
    if (detail?.key !== ' ') return;
    detail?.preventDefault?.();
  });

  // P-BASE-BUTTON-ROLE-COMMAND, P-BASE-BUTTON-DISABLED-SUPPRESS-ACTIVATION
  def.event.on('press.commit', (run) => {
    if (disabled.get()) return;
    run.expose.emit('click');
  });

  /*
   * TODO(P-BASE-BUTTON-ACCESSIBLE-ROLE): practice through the future a11y prototype syntax.
   * TODO(P-BASE-BUTTON-ACCESSIBLE-NAME): practice through the future a11y prototype syntax.
   * TODO(P-BASE-BUTTON-CONTENT-LABEL-SOURCE): practice through the future a11y prototype syntax.
   * TODO(P-BASE-BUTTON-PROP-LABEL-DEFERRED): keep accessible naming out of core props once a11y syntax exists.
   * TODO(P-BASE-BUTTON-A11Y-ENHANCEMENT): practice optional a11y enhancements through the future a11y syntax.
   */
}

/*
 * P-BASE-BUTTON criteria outside Button-internal prototype syntax:
 * - P-BASE-BUTTON-NO-VISUAL-VARIANT-CORE: absence of visual props is the implementation.
 * - P-BASE-BUTTON-PROP-VISUAL-DEFERRED: owned by feedback/style or visual variants.
 * - P-BASE-BUTTON-ICON-CONTENT: content/styling convention, not a Button structure API.
 * - P-BASE-BUTTON-PROP-FORM-DEFERRED: awaits Form prototype cataloging.
 * - P-BASE-BUTTON-FORM-EXTENSION: awaits Form prototype cataloging.
 * - P-BASE-BUTTON-PROP-COMMAND-DEFERRED: awaits command/overlay capability cataloging.
 */

// P-BASE-BUTTON-AUTHORING-ENTRIES
export const asButton = defineAsHook<ButtonProps, ButtonExposes, ButtonAsHookContract>({
  name: 'as-button',
  setup: setupButton,
});

const button = definePrototype({
  name: 'base-button',
  setup: setupButton,
});

export default button;
