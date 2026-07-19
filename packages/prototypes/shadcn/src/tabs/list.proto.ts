import { definePrototype, tw } from '@proto.ui/core';
import { asTabsList } from '@proto.ui/prototypes-base';
import type { ShadcnTabsListExposes, ShadcnTabsListProps } from './types';

const tabsList = definePrototype<ShadcnTabsListProps, ShadcnTabsListExposes>({
  name: 'shadcn-tabs-list',
  setup(def) {
    // P-SHADCN-TABS-LIST-BASE-INHERITANCE, P-SHADCN-TABS-LIST-CURRENT-BASE-DEVIATIONS
    asTabsList();
    // P-SHADCN-TABS-LIST-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(
      tw(
        'inline-flex h-10 items-center rounded-xl border border-border/60 bg-muted/80 p-1 text-muted-foreground shadow-xs'
      )
    );
  },
});

/** P-SHADCN-TABS-LIST-DIRECT-ENTRY; parity remains bounded by P-SHADCN-TABS-LIST-COMPATIBILITY-SUBSET. */

export default tabsList;
