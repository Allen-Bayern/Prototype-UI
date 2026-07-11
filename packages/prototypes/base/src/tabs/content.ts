import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asFocusEntry, asPresence } from '@proto.ui/hooks';
import { createTabsPartId, TABS_CONTEXT, TABS_FAMILY, type TabsContextValue } from './shared';
import type { TabsContentAsHookContract, TabsContentExposes, TabsContentProps } from './types';

function syncCurrentFromContext(
  nextValue: string,
  ownValue: string,
  current: { set(value: boolean, reason?: string): void },
  hidden: { set(value: boolean, reason?: string): void },
  focusEntry: { setDisabled(disabled: boolean): void }
): void {
  const nextCurrent = ownValue === nextValue;
  current.set(nextCurrent, 'reason: tabs context sync => current');
  hidden.set(!nextCurrent, 'reason: tabs context sync => hidden');
  focusEntry.setDisabled(!nextCurrent);
}

function setupTabsContent(def: DefHandle<TabsContentProps, TabsContentExposes>): void {
  // P-BASE-TABS-CONTENT-CLAIM-ROLE, P-BASE-TABS-CONTENT-SAME-DOMAIN
  def.anatomy.claim(TABS_FAMILY, { role: 'content' });
  // P-BASE-TABS-CONTENT-CURRENT-DERIVED
  const current = def.state.bool('current', false);
  const hidden = def.state.bool('hidden', true);
  const contentId = def.state.string('contentId', '');
  const triggerId = def.state.string('triggerId', '');
  // P-BASE-TABS-CONTENT-FOCUS-ENTRY
  const focusEntry = asFocusEntry<TabsContentProps>();
  const presence = asPresence({ mode: 'immediate' });
  focusEntry.configure({
    strategy: 'descendant-first',
    fallback: 'self',
    disabled: true,
  });

  def.props.define({
    value: { type: 'string', empty: 'fallback' },
    lazyMount: { type: 'boolean', empty: 'fallback' },
    unmountOnExit: { type: 'boolean', empty: 'fallback' },
    keepMounted: { type: 'boolean', empty: 'fallback' },
  });
  def.props.setDefaults({
    value: '',
    lazyMount: false,
    unmountOnExit: false,
    keepMounted: false,
  });

  let ownValue = '';
  let rootId = '';
  let lazyMount = false;
  let unmountOnExit = false;
  let keepMounted = false;
  let hasBeenCurrent = false;
  def.expose.state('current', current);
  def.expose.state('hidden', hidden);

  // P-BASE-TABS-CONTENT-A11Y-ROLE, P-BASE-TABS-CONTENT-A11Y-LABELLEDBY-TARGET
  // P-BASE-TABS-CONTENT-HIDDEN-WHEN-INACTIVE
  def.a11y.id(contentId);
  def.a11y.role('tabpanel');
  def.a11y.state('hidden', hidden);
  def.a11y.relation('labelledBy', { target: triggerId });

  const syncIds = () => {
    contentId.set(createTabsPartId(rootId, 'content', ownValue), 'reason: tabs content id sync');
    triggerId.set(
      createTabsPartId(rootId, 'trigger', ownValue),
      'reason: tabs content relation sync'
    );
  };

  const syncContext = (next: TabsContextValue) => {
    rootId = next.rootId;
    syncIds();
    syncCurrentFromContext(next.value, ownValue, current, hidden, focusEntry);
    const nextCurrent = next.value === ownValue;
    if (nextCurrent) hasBeenCurrent = true;
    const shouldMount =
      keepMounted || nextCurrent || (!unmountOnExit && (!lazyMount || hasBeenCurrent));
    presence.setPresent(shouldMount);
  };

  def.context.subscribe(TABS_CONTEXT, (_run, next) => {
    syncContext(next);
  });

  const syncProps = (next: Readonly<TabsContentProps>) => {
    ownValue = next.value ?? '';
    lazyMount = next.lazyMount ?? false;
    unmountOnExit = next.unmountOnExit ?? false;
    keepMounted = next.keepMounted ?? false;
  };

  def.lifecycle.onCreated((run) => {
    syncProps(run.props.get());
    syncContext(run.context.read(TABS_CONTEXT));
  });

  def.lifecycle.onMounted((run) => {
    syncContext(run.context.read(TABS_CONTEXT));
  });

  def.props.watch(['value', 'lazyMount', 'unmountOnExit', 'keepMounted'], (run, next) => {
    syncProps(next);
    syncContext(run.context.read(TABS_CONTEXT));
  });

  // TODO(P-BASE-TABS-CONTENT-HIDDEN-WHEN-INACTIVE): Web currently also receives
  // a host hidden attribute from a11y state projection; this style fallback
  // keeps current feedback-style demos stable until hidden is modeled as a
  // dedicated host capability outside a11y.
  def.rule({
    when: (w) => w.state(hidden).eq(true),
    intent: (i) => i.feedback.style.use(tw('hidden')),
  });
}

export const asTabsContent = defineAsHook<
  TabsContentProps,
  TabsContentExposes,
  TabsContentAsHookContract
>({
  name: 'as-tabs-content',
  setup: setupTabsContent,
});

const tabsContent = definePrototype({
  name: 'base-tabs-content',
  setup: setupTabsContent,
});

export default tabsContent;
