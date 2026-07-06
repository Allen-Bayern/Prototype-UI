import { createAnatomyFamily, createContextKey } from '@proto.ui/core';

export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

export type TabsContextValue = {
  rootId: string;
  value: string;
  activeValue: string;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  controlled: boolean;
  requestedValue: string;
  requestVersion: number;
  validationVersion: number;
};

let nextTabsRootId = 0;

export function createTabsRootId(): string {
  nextTabsRootId += 1;
  return `pui-tabs-${nextTabsRootId}`;
}

export function createTabsPartId(
  rootId: string,
  role: 'trigger' | 'content',
  value: string
): string {
  const normalizedValue = value.trim() ? value.trim() : 'empty';
  const safeValue = normalizedValue.replace(/[^a-zA-Z0-9_-]+/g, '-');
  return `${rootId || 'pui-tabs'}-${role}-${safeValue}`;
}

export const TABS_FAMILY = createAnatomyFamily('base-tabs', {
  roles: {
    root: { cardinality: { min: 1, max: 1 } },
    list: { cardinality: { min: 0, max: 1 } },
    trigger: { cardinality: { min: 0, max: 100 } },
    content: { cardinality: { min: 0, max: 100 } },
    indicator: { cardinality: { min: 0, max: '*' } },
  },
  relations: [
    { kind: 'contains', parent: 'root', child: 'list' },
    { kind: 'contains', parent: 'list', child: 'trigger' },
    { kind: 'contains', parent: 'root', child: 'content' },
    { kind: 'contains', parent: 'root', child: 'indicator' },
  ],
});
export const TABS_CONTEXT = createContextKey<TabsContextValue>('base-tabs');
