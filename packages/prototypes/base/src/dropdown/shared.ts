import { createAnatomyFamily, createContextKey } from '@proto.ui/core';
import type { DropdownOpenEntry } from './types';

export type DropdownContextValue = {
  open: boolean;
  controlled: boolean;
  disabled: boolean;
  activeValue: string;
  closeOnItemCommit: boolean;
  openEntry: DropdownOpenEntry;
  openEntryValue: string;
};

export const DROPDOWN_FAMILY = createAnatomyFamily('base-dropdown', {
  roles: {
    root: { cardinality: { min: 1, max: 1 } },
    trigger: { cardinality: { min: 0, max: 1 } },
    content: { cardinality: { min: 0, max: 1 } },
    item: { cardinality: { min: 0, max: 100 } },
  },
  relations: [
    { kind: 'contains', parent: 'root', child: 'trigger' },
    { kind: 'contains', parent: 'root', child: 'content' },
    { kind: 'contains', parent: 'content', child: 'item' },
  ],
});
export const DROPDOWN_CONTEXT = createContextKey<DropdownContextValue>('base-dropdown');
