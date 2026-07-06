import { defineAsHook, definePrototype, type DefHandle, type RunHandle } from '@proto.ui/core';
import { useCollection } from '@proto.ui/hooks';
import { createTabsRootId, TABS_CONTEXT, TABS_FAMILY } from './shared';
import type { TabsRootAsHookContract, TabsRootExposes, TabsRootProps } from './types';

type TriggerSnapshot = {
  value?: unknown;
  disabled?: unknown;
};

function readTriggerSnapshot(part: { getExpose(key: string): unknown | null }): TriggerSnapshot {
  const exposed = part.getExpose('__collectionItem');
  const disabledExpose = part.getExpose('disabled');
  const disabled =
    disabledExpose &&
    typeof disabledExpose === 'object' &&
    typeof (disabledExpose as { get?: unknown }).get === 'function'
      ? (disabledExpose as { get(): unknown }).get()
      : undefined;
  const withLiveDisabled = (snapshot: TriggerSnapshot): TriggerSnapshot =>
    typeof disabled === 'undefined' ? snapshot : { ...snapshot, disabled };
  if (typeof exposed === 'function') {
    const next = exposed();
    return next && typeof next === 'object' ? withLiveDisabled(next as TriggerSnapshot) : {};
  }
  return exposed && typeof exposed === 'object' ? withLiveDisabled(exposed as TriggerSnapshot) : {};
}

function getEnabledTriggerValues(run: RunHandle<TabsRootProps>): string[] {
  return run.anatomy.order
    .partsOf(TABS_FAMILY, 'trigger')
    .map(readTriggerSnapshot)
    .filter((snapshot) => typeof snapshot.value === 'string' && snapshot.value)
    .filter((snapshot) => snapshot.disabled !== true)
    .map((snapshot) => snapshot.value as string);
}

function hasEnabledTriggerValue(run: RunHandle<TabsRootProps>, target: string): boolean {
  return getEnabledTriggerValues(run).includes(target);
}

function setupTabsRoot(def: DefHandle<TabsRootProps, TabsRootExposes>): void {
  // P-BASE-TABS-ANATOMY-FAMILY, P-BASE-TABS-ROOT-SEMANTIC-OWNER
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

  // P-BASE-TABS-VALUE-EXPOSE, P-BASE-TABS-CONTEXT-VALUE
  def.context.provide(TABS_CONTEXT, {
    rootId: '',
    value: '',
    activeValue: '',
    orientation: 'horizontal',
    activationMode: 'automatic',
    controlled: false,
    requestedValue: '',
    requestVersion: 0,
    validationVersion: 0,
  });
  const value = def.state.string('value', '');
  const rootId = createTabsRootId();
  let currentOrientation: 'horizontal' | 'vertical' = 'horizontal';
  let currentActivationMode: 'automatic' | 'manual' = 'automatic';
  let controlled = false;
  let activeValue = '';
  let lastRequestVersion = 0;
  let lastValidationVersion = 0;

  def.expose.state('value', value);
  def.expose.event('valueChange', { payload: 'json' });

  const resolveSelection = (run: RunHandle<TabsRootProps>, candidate: string): string => {
    if (candidate && hasEnabledTriggerValue(run, candidate)) return candidate;
    const fallback = getEnabledTriggerValues(run)[0];
    return fallback ?? candidate ?? '';
  };

  const publishContext = (run: RunHandle<TabsRootProps>) => {
    const next = {
      rootId,
      value: value.get(),
      activeValue,
      orientation: currentOrientation,
      activationMode: currentActivationMode,
      controlled,
      requestedValue: '',
      requestVersion: lastRequestVersion,
      validationVersion: lastValidationVersion,
    };
    const current = run.context.read(TABS_CONTEXT);
    if (
      current.rootId === next.rootId &&
      current.value === next.value &&
      current.activeValue === next.activeValue &&
      current.orientation === next.orientation &&
      current.activationMode === next.activationMode &&
      current.controlled === next.controlled &&
      current.requestedValue === next.requestedValue &&
      current.requestVersion === next.requestVersion &&
      current.validationVersion === next.validationVersion
    ) {
      return;
    }
    run.context.update(TABS_CONTEXT, next);
  };

  const validateSelection = (run: RunHandle<TabsRootProps>, reason: string) => {
    const currentValue = value.get();
    const nextValue = controlled ? currentValue : resolveSelection(run, currentValue);
    if (!controlled && nextValue !== currentValue) {
      value.set(nextValue, reason);
    }
    if (!activeValue || !hasEnabledTriggerValue(run, activeValue)) {
      activeValue = nextValue;
    }
    publishContext(run);
  };

  def.context.subscribe(TABS_CONTEXT, (run, next) => {
    activeValue = next.activeValue ?? '';
    if (next.requestVersion !== lastRequestVersion) {
      lastRequestVersion = next.requestVersion;
      const requestedValue = next.requestedValue ?? '';
      if (!controlled) {
        value.set(requestedValue, 'reason: tabs value request => uncontrolled value sync');
      }
      run.expose.emit('valueChange', { value: requestedValue });
      validateSelection(run, 'reason: tabs value request => uncontrolled fallback sync');
      return;
    }
    if (next.validationVersion !== lastValidationVersion) {
      lastValidationVersion = next.validationVersion;
      if (!controlled && next.value !== value.get()) {
        value.set(next.value, 'reason: tabs part validation request => value sync');
      }
      validateSelection(run, 'reason: tabs part validation request => selection fallback');
      return;
    }
    if (!controlled && next.value !== value.get()) {
      value.set(next.value, 'reason: context.subscribe => uncontrolled tabs value sync');
    }
    validateSelection(run, 'reason: tabs context notification => selection fallback');
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
    lastValidationVersion = 0;
    publishContext(run);
  });

  def.lifecycle.onMounted((run) => {
    validateSelection(run, 'reason: lifecycle.onMounted => tabs selection fallback');
  });

  def.props.watch(['value', 'orientation', 'activationMode'], (run, next) => {
    controlled = run.props.isProvided('value');
    if (controlled) {
      value.set(next.value ?? '', 'reason: props.watch(value) => controlled tabs sync');
    }
    currentOrientation = next.orientation ?? 'horizontal';
    currentActivationMode = next.activationMode ?? 'automatic';
    validateSelection(run, 'reason: props.watch => tabs selection fallback');
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
