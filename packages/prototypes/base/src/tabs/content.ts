import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asFocusEntry } from '@proto.ui/hooks';
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
  focusEntry.configure({
    strategy: 'descendant-first',
    fallback: 'self',
    disabled: true,
  });

  def.props.define({
    value: { type: 'string', empty: 'fallback' },
  });
  def.props.setDefaults({
    value: '',
  });

  let ownValue = '';
  let rootId = '';
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
  };

  def.context.subscribe(TABS_CONTEXT, (_run, next) => {
    syncContext(next);
  });

  def.lifecycle.onMounted((run) => {
    ownValue = run.props.get().value ?? '';
    syncContext(run.context.read(TABS_CONTEXT));
  });

  def.props.watch(['value'], (run, next) => {
    ownValue = next.value ?? '';
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
