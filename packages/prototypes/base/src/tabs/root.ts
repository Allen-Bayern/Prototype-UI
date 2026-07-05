import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { useCollection } from '@proto.ui/hooks';
import { createTabsRootId, TABS_CONTEXT, TABS_FAMILY } from './shared';
import type { TabsRootAsHookContract, TabsRootExposes, TabsRootProps } from './types';

function setupTabsRoot(def: DefHandle<TabsRootProps, TabsRootExposes>): void {
  def.anatomy.claim(TABS_FAMILY, { role: 'root' });
  useCollection({ family: TABS_FAMILY, itemRole: 'trigger' });

  def.props.define({
    value: { type: 'string', empty: 'fallback' },
    defaultValue: { type: 'string', empty: 'fallback' },
    orientation: { type: 'enum', empty: 'fallback', options: ['horizontal', 'vertical'] },
    activationMode: { type: 'enum', empty: 'fallback', options: ['automatic', 'manual'] },
  });
  def.props.setDefaults({
    defaultValue: '',
    orientation: 'horizontal',
    activationMode: 'automatic',
  });

  def.context.provide(TABS_CONTEXT, {
    rootId: '',
    value: '',
    activeValue: '',
    orientation: 'horizontal',
    activationMode: 'automatic',
    controlled: false,
    requestedValue: '',
    requestVersion: 0,
  });
  const value = def.state.string('value', '');
  const rootId = createTabsRootId();
  let currentOrientation: 'horizontal' | 'vertical' = 'horizontal';
  let currentActivationMode: 'automatic' | 'manual' = 'automatic';
  let controlled = false;
  let activeValue = '';
  let lastRequestVersion = 0;

  def.expose.state('value', value);
  def.expose.event('valueChange', { payload: 'json' });

  def.context.subscribe(TABS_CONTEXT, (run, next) => {
    activeValue = next.activeValue ?? '';
    if (next.requestVersion !== lastRequestVersion) {
      lastRequestVersion = next.requestVersion;
      const requestedValue = next.requestedValue ?? '';
      if (!controlled) {
        value.set(requestedValue, 'reason: tabs value request => uncontrolled value sync');
      }
      run.expose.emit('valueChange', { value: requestedValue });
      run.context.update(TABS_CONTEXT, {
        ...next,
        rootId,
        value: value.get(),
        activeValue: requestedValue,
        orientation: currentOrientation,
        activationMode: currentActivationMode,
        controlled,
      });
      return;
    }
    if (controlled) return;
    value.set(next.value, 'reason: context.subscribe => uncontrolled tabs value sync');
  });

  def.lifecycle.onCreated((run) => {
    controlled = run.props.isProvided('value');
    const initialValue = controlled
      ? (run.props.get().value ?? '')
      : (run.props.get().defaultValue ?? '');
    currentOrientation = run.props.get().orientation ?? 'horizontal';
    currentActivationMode = run.props.get().activationMode ?? 'automatic';
    value.set(initialValue, 'reason: lifecycle.onCreated => initialize tabs value');
    activeValue = initialValue;
    run.context.update(TABS_CONTEXT, {
      rootId,
      value: value.get(),
      activeValue,
      orientation: currentOrientation,
      activationMode: currentActivationMode,
      controlled,
      requestedValue: '',
      requestVersion: lastRequestVersion,
    });
  });

  def.props.watch(['value', 'orientation', 'activationMode'], (run, next) => {
    controlled = run.props.isProvided('value');
    if (controlled) {
      value.set(next.value ?? '', 'reason: props.watch(value) => controlled tabs sync');
    }
    currentOrientation = next.orientation ?? 'horizontal';
    currentActivationMode = next.activationMode ?? 'automatic';
    run.context.update(TABS_CONTEXT, {
      rootId,
      value: value.get(),
      activeValue,
      orientation: currentOrientation,
      activationMode: currentActivationMode,
      controlled,
      requestedValue: '',
      requestVersion: lastRequestVersion,
    });
  });
}

export const asTabsRoot = defineAsHook<TabsRootProps, TabsRootExposes, TabsRootAsHookContract>({
  name: 'as-tabs-root',
  setup: setupTabsRoot,
});

const tabsRoot = definePrototype({
  name: 'base-tabs-root',
  setup: setupTabsRoot,
});

export default tabsRoot;
