import { definePrototype } from '@proto.ui/core';
import { asSelectRoot } from '@proto.ui/prototypes-base';
import type { ShadcnSelectRootExposes, ShadcnSelectRootProps } from './types';

const selectRoot = definePrototype<ShadcnSelectRootProps, ShadcnSelectRootExposes>({
  name: 'shadcn-select-root',
  setup() {
    asSelectRoot();
  },
});

export default selectRoot;
