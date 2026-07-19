import { definePrototype, tw } from '@proto.ui/core';
import { asTabsRoot } from '@proto.ui/prototypes-base/tabs';
import type { ShadcnTabsRootExposes, ShadcnTabsRootProps } from './types';

const tabsRoot = definePrototype<ShadcnTabsRootProps, ShadcnTabsRootExposes>({
  name: 'shadcn-tabs-root',
  setup(def) {
    // P-SHADCN-TABS-BASE-INHERITANCE, P-SHADCN-TABS-CURRENT-BASE-DEVIATIONS
    asTabsRoot();
    // P-SHADCN-TABS-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(tw('flex flex-col gap-3 text-foreground'));
  },
});

/** P-SHADCN-TABS-DIRECT-ENTRY; parity remains bounded by P-SHADCN-TABS-COMPATIBILITY-SUBSET. */

export default tabsRoot;
