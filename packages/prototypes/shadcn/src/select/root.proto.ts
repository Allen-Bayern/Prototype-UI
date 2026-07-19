import { definePrototype } from '@proto.ui/core';
import { asSelectRoot } from '@proto.ui/prototypes-base';
import type { ShadcnSelectRootExposes, ShadcnSelectRootProps } from './types';

const selectRoot = definePrototype<ShadcnSelectRootProps, ShadcnSelectRootExposes>({
  name: 'shadcn-select-root',
  setup() {
    // P-SHADCN-SELECT-BASE-INHERITANCE, P-SHADCN-SELECT-CURRENT-BASE-DEVIATIONS
    asSelectRoot();
  },
});

/** P-SHADCN-SELECT-DIRECT-ENTRY; parity is bounded by P-SHADCN-SELECT-COMPATIBILITY-SUBSET. */

export default selectRoot;
