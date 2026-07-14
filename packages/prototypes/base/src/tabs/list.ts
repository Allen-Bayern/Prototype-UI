import { defineAsHook, definePrototype, type DefHandle, type RunHandle } from '@proto.ui/core';
import { asFocusRoving } from '@proto.ui/hooks';
import { TABS_CONTEXT, TABS_FAMILY } from './shared';
import type { TabsListAsHookContract, TabsListExposes, TabsListProps } from './types';

function setupTabsList(def: DefHandle<TabsListProps, TabsListExposes>): void {
  // P-BASE-TABS-LIST-CLAIM-ROLE, P-BASE-TABS-LIST-SAME-DOMAIN
  def.anatomy.claim(TABS_FAMILY, { role: 'list' });
  let selectedValue = '';
  let mountedRun: RunHandle<TabsListProps> | null = null;

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

  // P-BASE-TABS-LIST-FOCUS-ROVING, P-BASE-TABS-LIST-SKIP-DISABLED
  // P-BASE-TABS-LIST-ORIENTATION-KEYS, P-BASE-TABS-LIST-HOME-END
  const focusRoving = asFocusRoving<TabsListProps>();
  focusRoving.configure({
    navigation: 'arrow',
    orientation: 'horizontal',
    entry: 'manual',
  });

  // P-BASE-TABS-LIST-FOCUS-METHODS
  def.expose.method('focusFirst', () => focusRoving.focusFirst());
  def.expose.method('focusLast', () => focusRoving.focusLast());
  def.expose.method('focusNext', () => focusRoving.focusNext());
  def.expose.method('focusPrev', () => focusRoving.focusPrev());
  def.expose.method('focusSelected', () => {
    if (!mountedRun || !selectedValue) return;
    const selected = mountedRun.anatomy.order.partsOf(TABS_FAMILY, 'trigger').find((part) => {
      const read = part.getExpose('__collectionItem');
      const snapshot = typeof read === 'function' ? read() : read;
      return (snapshot as { value?: unknown } | null)?.value === selectedValue;
    });
    const focusSelf = selected?.getExpose('focusSelf');
    if (typeof focusSelf === 'function') focusSelf({ reason: 'keyboard' });
  });

  // TODO(C-AS-FOCUS-ROVING-0001-B): route focusSelected directly through the
  // roving handle after Focus models semantic selected membership. Its current
  // generic implementation resolves "selected" to the first eligible member,
  // which is incorrect for manual-activation Tabs after focus has roved.

  def.context.subscribe(TABS_CONTEXT, (_run, next) => {
    selectedValue = next.value ?? '';
    const nextOrientation = next.orientation ?? 'horizontal';
    orientation.set(nextOrientation, 'reason: tabs list context orientation sync');
    focusRoving.setOrientation(nextOrientation);
  });

  def.lifecycle.onMounted((run) => {
    mountedRun = run;
    const ctx = run.context.read(TABS_CONTEXT);
    selectedValue = ctx.value ?? '';
    const nextOrientation = ctx.orientation ?? 'horizontal';
    orientation.set(nextOrientation, 'reason: tabs list mounted orientation sync');
    focusRoving.setOrientation(nextOrientation);
    focusRoving.setLoop(!!run.props.get().loop);
    a11yLabel.set(run.props.get().a11yLabel ?? '', 'reason: tabs list mounted a11y label sync');
  });

  def.props.watch(['loop', 'a11yLabel'], (_run, next) => {
    focusRoving.setLoop(!!next.loop);
    a11yLabel.set(next.a11yLabel ?? '', 'reason: tabs list props a11y label sync');
  });

  def.lifecycle.onUnmounted(() => {
    mountedRun = null;
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
