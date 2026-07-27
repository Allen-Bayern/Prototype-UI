import { definePrototype, tw } from '@proto.ui/core';
import { asTabsList } from '@proto.ui/prototypes-base/tabs';
import type { ShadcnTabsListExposes, ShadcnTabsListProps } from './types';

const tabsList = definePrototype<ShadcnTabsListProps, ShadcnTabsListExposes>({
  name: 'shadcn-tabs-list',
  setup(def) {
    // P-SHADCN-TABS-LIST-BASE-INHERITANCE, P-SHADCN-TABS-LIST-CURRENT-BASE-DEVIATIONS
    asTabsList();
    // P-SHADCN-TABS-LIST-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(
      tw(
        'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'
      )
    );
  },
});

/** P-SHADCN-TABS-LIST-DIRECT-ENTRY; parity remains bounded by P-SHADCN-TABS-LIST-COMPATIBILITY-SUBSET. */

export default tabsList;
