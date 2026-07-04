import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { asFocusable, asTrigger } from '@proto.ui/hooks';
import { SWITCH_CONTEXT, SWITCH_FAMILY } from './shared';
import type { SwitchRootAsHookContract, SwitchRootExposes, SwitchRootProps } from './types';

function setupSwitchRoot(def: DefHandle<SwitchRootProps, SwitchRootExposes>): void {
  // P-BASE-SWITCH-ROLE-ON-OFF-VALUE, P-BASE-SWITCH-DISPLAY-AND-INPUT
  // P-BASE-SWITCH-ROOT-SEMANTIC-OWNER, P-BASE-SWITCH-ROOT-DOMAIN-ANCHOR
  def.anatomy.claim(SWITCH_FAMILY, { role: 'root' });

  // P-BASE-SWITCH-PROTOCOL-INDEPENDENCE, P-BASE-SWITCH-TRIGGER-SEMANTICS
  asTrigger();

  // P-BASE-SWITCH-PROP-CHECKED, P-BASE-SWITCH-PROP-DEFAULT-CHECKED
  // P-BASE-SWITCH-PROP-DISABLED, P-BASE-SWITCH-NO-MIXED-STATE
  // P-BASE-SWITCH-PROP-NO-EVENT-CALLBACK
  def.props.define({
    checked: { type: 'boolean', empty: 'fallback' },
    defaultChecked: { type: 'boolean', empty: 'fallback' },
    disabled: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    defaultChecked: false,
    disabled: false,
  });

  // P-BASE-SWITCH-CHECKED-EXPOSE, P-BASE-SWITCH-DISABLED-EXPOSE
  const checked = def.state.fromAccessibility('checked');
  const disabled = def.state.fromInteraction('disabled');
  // P-BASE-SWITCH-POINTER-HOVER
  const hovered = def.state.fromInteraction('hovered');
  // P-BASE-SWITCH-PRESS-LIFECYCLE
  const pressed = def.state.fromInteraction('pressed');
  // P-BASE-SWITCH-FOCUSABLE, P-BASE-SWITCH-DISABLED-REJECT-FOCUS
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
  // P-BASE-SWITCH-REQUEST-FOCUS, P-BASE-SWITCH-DISABLED-REJECT-FOCUS
  def.expose.method('focusSelf', (options) => {
    if (disabled.get()) return;
    focusable.focusSelf(options);
  });
  // P-BASE-SWITCH-CHECKED-CHANGE-SIGNAL, P-BASE-SWITCH-CHECKED-CHANGE-PROTOCOL-NAME
  def.expose.event('checkedChange', { payload: 'json' });

  // P-BASE-SWITCH-ACCESSIBLE-ROLE
  def.a11y.role('switch');
  // P-BASE-SWITCH-ACCESSIBLE-NAME, P-BASE-SWITCH-STABLE-LABEL
  def.a11y.nameFromContent();
  // P-BASE-SWITCH-A11Y-CHECKED, P-BASE-SWITCH-A11Y-NO-MIXED
  def.a11y.state('checked', checked);
  def.a11y.state('disabled', disabled);
  def.a11y.action('activate', { event: 'checkedChange' });

  // P-BASE-SWITCH-CONTEXT-PROVIDE, P-BASE-SWITCH-CONTEXT-VALUE
  def.context.provide(SWITCH_CONTEXT, {
    checked: false,
    disabled: false,
  });

  let controlled = false;

  const publishContext = (run: any) => {
    // P-BASE-SWITCH-CONTEXT-SYNC, P-BASE-SWITCH-PART-CONTEXT-CONSUME
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

  // P-BASE-SWITCH-CONTROLLED-CHECKED, P-BASE-SWITCH-CONTROLLED-EMITS-NEXT
  // P-BASE-SWITCH-UNCONTROLLED-UPDATES-CHECKED
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

  // P-BASE-SWITCH-CONTROLLED-CHECKED
  def.props.watch(['checked'], (run, next) => {
    controlled = run.props.isProvided('checked');
    if (!controlled) return;
    checked.set(!!next.checked, 'reason: switch root controlled checked sync');
    publishContext(run);
  });

  // P-BASE-SWITCH-DISABLED-EXPOSE, P-BASE-SWITCH-DISABLED-CLEAR-TRANSIENT
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

  // P-BASE-SWITCH-KEYBOARD-SPACE-ACTIVATION, P-BASE-SWITCH-KEYBOARD-ENTER-OPTIONAL
  // P-BASE-SWITCH-KEYBOARD-SPACE-PREVENT-DEFAULT
  def.event.onGlobal('key.down', (_run, ev) => {
    const detail = ev?.detail;
    if (disabled.get()) return;
    if (!focused.get()) return;
    if (detail?.key !== ' ') return;
    detail?.preventDefault?.();
  });

  // P-BASE-SWITCH-ACTIVATION-FLIPS-CHECKED, P-BASE-SWITCH-DISABLED-SUPPRESS-ACTIVATION
  // P-BASE-SWITCH-UNCONTROLLED-UPDATES-CHECKED, P-BASE-SWITCH-CONTROLLED-EMITS-NEXT
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

/*
 * P-BASE-SWITCH criteria outside Switch-root-internal prototype syntax:
 * - P-BASE-SWITCH-CLICK-DEFERRED: absence of a `click` expose event is the implementation.
 * - P-BASE-SWITCH-INDICATOR-PRESENTATIONAL-A11Y: owned by root semantics and thumb's absence of a11y control syntax.
 * - P-BASE-SWITCH-PROP-LABEL-DEFERRED: accessible naming uses content/a11y projection; no `label` prop is accepted.
 * - P-BASE-SWITCH-FORM-INTEGRATION-DEFERRED: awaits Form prototype cataloging.
 * - P-BASE-SWITCH-NO-VISUAL-VARIANT-CORE: visual parameters are owned by downstream styled prototypes.
 * - P-BASE-SWITCH-TRACK-DEFERRED: track is not an official Switch core part in this implementation.
 */

// P-BASE-SWITCH-AUTHORING-ENTRIES
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
