import { definePrototype } from '@proto.ui/core';
import { asDropdownRoot } from '@proto.ui/prototypes-base/dropdown';
import type { ShadcnDropdownRootExposes, ShadcnDropdownRootProps } from './types';

const dropdownRoot = definePrototype<ShadcnDropdownRootProps, ShadcnDropdownRootExposes>({
  name: 'shadcn-dropdown-root',
  setup(def) {
    // P-SHADCN-DROPDOWN-MENU-BASE-INHERITANCE,
    // P-SHADCN-DROPDOWN-MENU-CURRENT-BASE-DEVIATIONS
    asDropdownRoot();
  },
});

/** P-SHADCN-DROPDOWN-MENU-DIRECT-ENTRY; parity is bounded by P-SHADCN-DROPDOWN-MENU-COMPATIBILITY-SUBSET. */

export default dropdownRoot;
