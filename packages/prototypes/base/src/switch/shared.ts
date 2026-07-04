import { createAnatomyFamily, createContextKey } from '@proto.ui/core';

export type SwitchContextValue = {
  checked: boolean;
  disabled: boolean;
};

export const SWITCH_FAMILY = createAnatomyFamily('base-switch', {
  roles: {
    root: { cardinality: { min: 1, max: 1 } },
    thumb: { cardinality: { min: 0, max: '*' } },
  },
  relations: [{ kind: 'contains', parent: 'root', child: 'thumb' }],
});

export const SWITCH_CONTEXT = createContextKey<SwitchContextValue>('base-switch');
