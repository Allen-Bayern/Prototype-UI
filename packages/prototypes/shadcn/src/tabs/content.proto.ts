import { definePrototype, tw } from '@proto.ui/core';
import { asTabsContent } from '@proto.ui/prototypes-base';
import type { ShadcnTabsContentExposes, ShadcnTabsContentProps } from './types';

const tabsContent = definePrototype<ShadcnTabsContentProps, ShadcnTabsContentExposes>({
  name: 'shadcn-tabs-content',
  setup(def) {
    // P-SHADCN-TABS-CONTENT-BASE-INHERITANCE,
    // P-SHADCN-TABS-CONTENT-CURRENT-BASE-DEVIATIONS
    const contentState = asTabsContent().stateHandles;
    if (!contentState) {
      throw new Error(
        '[shadcn-tabs-content] asTabsContent must project Tabs content state handles.'
      );
    }
    const { hidden } = contentState;
    // P-SHADCN-TABS-CONTENT-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(
      tw(
        'block w-full min-h-28 rounded-xl border border-border/60 bg-background p-4 text-sm leading-6 shadow-xs outline-none'
      )
    );
    // P-SHADCN-TABS-CONTENT-HIDDEN-PROJECTION
    def.rule({
      when: (w) => w.state(hidden).eq(true),
      intent: (i) => i.feedback.style.use(tw('hidden')),
    });
  },
});

/** P-SHADCN-TABS-CONTENT-DIRECT-ENTRY; parity remains bounded by P-SHADCN-TABS-CONTENT-COMPATIBILITY-SUBSET. */

export default tabsContent;
