import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { asFocusRoving } from '@proto.ui/hooks';
import { useFocusRoving } from '../behaviors';
import { TABS_CONTEXT, TABS_FAMILY } from './shared';
import type { TabsListAsHookContract, TabsListExposes, TabsListProps } from './types';

function setupTabsList(def: DefHandle<TabsListProps, TabsListExposes>): void {
  // P-BASE-TABS-LIST-CLAIM-ROLE, P-BASE-TABS-LIST-SAME-DOMAIN
  def.anatomy.claim(TABS_FAMILY, { role: 'list' });
  let activeValue = '';
  let selectedValue = '';

  def.props.define({
    orientation: { type: 'enum', empty: 'fallback', options: ['horizontal', 'vertical'] },
    loop: { type: 'boolean', empty: 'fallback' },
    a11yLabel: { type: 'string', empty: 'fallback' },
  });
  def.props.setDefaults({
    orientation: 'horizontal',
    loop: false,
    a11yLabel: '',
  });

  const orientation = def.state.string('orientation', 'horizontal', {
    options: ['horizontal', 'vertical'],
  });
  const a11yLabel = def.state.string('a11yLabel', '');
  // P-BASE-TABS-LIST-A11Y-ROLE, P-BASE-TABS-LIST-A11Y-ORIENTATION
  def.a11y.role('tablist');
  def.a11y.name(a11yLabel);
  def.a11y.state('orientation', orientation);

  const focusRoving = asFocusRoving<TabsListProps>();
  focusRoving.configure({
    navigation: 'none',
    orientation: 'horizontal',
    entry: 'manual',
  });
  useFocusRoving({
    family: TABS_FAMILY,
    itemRole: 'trigger',
    loop: false,
    skipDisabled: true,
    getId: (snapshot) => {
      const value = snapshot.value;
      return typeof value === 'string' && value ? value : null;
    },
    getActiveId: () => activeValue,
    getCurrentId: () => selectedValue,
    exposeFocusCurrentMethodKey: 'focusSelected',
  });

  def.context.subscribe(TABS_CONTEXT, (_run, next) => {
    activeValue = next.activeValue ?? '';
    selectedValue = next.value ?? '';
    orientation.set(next.orientation ?? 'horizontal', 'reason: tabs list context orientation sync');
  });

  def.lifecycle.onMounted((run) => {
    const ctx = run.context.read(TABS_CONTEXT);
    activeValue = ctx.activeValue ?? '';
    selectedValue = ctx.value ?? '';
    orientation.set(ctx.orientation ?? 'horizontal', 'reason: tabs list mounted orientation sync');
    a11yLabel.set(run.props.get().a11yLabel ?? '', 'reason: tabs list mounted a11y label sync');
  });

  def.props.watch(['a11yLabel'], (_run, next) => {
    a11yLabel.set(next.a11yLabel ?? '', 'reason: tabs list props a11y label sync');
  });

  def.lifecycle.onUnmounted(() => {
    activeValue = '';
    selectedValue = '';
  });
}

export const asTabsList = defineAsHook<TabsListProps, TabsListExposes, TabsListAsHookContract>({
  name: 'as-tabs-list',
  setup: setupTabsList,
});

const tabsList = definePrototype({
  name: 'base-tabs-list',
  setup: setupTabsList,
});

export default tabsList;
