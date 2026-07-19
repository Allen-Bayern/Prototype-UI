import { definePrototype } from '@proto.ui/core';
import { asDropdownRoot } from '@proto.ui/prototypes-base';
import type { ShadcnDropdownRootExposes, ShadcnDropdownRootProps } from './types';

const dropdownRoot = definePrototype<ShadcnDropdownRootProps, ShadcnDropdownRootExposes>({
  name: 'shadcn-dropdown-root',
  setup(def) {
    asDropdownRoot();
  },
});

export default dropdownRoot;
