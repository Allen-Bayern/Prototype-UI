import { createAnatomyFamily, createContextKey } from '@proto.ui/core';

export type CheckboxContextValue = {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
};

export const CHECKBOX_FAMILY = createAnatomyFamily('base-checkbox', {
  roles: {
    root: { cardinality: { min: 1, max: 1 } },
    indicator: { cardinality: { min: 0, max: '*' } },
  },
  relations: [{ kind: 'contains', parent: 'root', child: 'indicator' }],
});

export const CHECKBOX_CONTEXT = createContextKey<CheckboxContextValue>('base-checkbox');
