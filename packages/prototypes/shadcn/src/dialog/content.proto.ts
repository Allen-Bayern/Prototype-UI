import { definePrototype, tw } from '@proto.ui/core';
import { asDialogContent } from '@proto.ui/prototypes-base';
import type { ShadcnDialogContentExposes, ShadcnDialogContentProps } from './types';

const dialogContent = definePrototype<ShadcnDialogContentProps, ShadcnDialogContentExposes>({
  name: 'shadcn-dialog-content',
  setup(def) {
    // P-SHADCN-DIALOG-CONTENT-BASE-INHERITANCE,
    // P-SHADCN-DIALOG-CONTENT-PUBLIC-BOUNDARY-DEVIATION
    const dialog = asDialogContent();
    // P-SHADCN-DIALOG-CONTENT-TRANSITION
    dialog.asTransition.configure({ enterDuration: 200, leaveDuration: 200 });
    const dialogState = dialog.stateHandles;
    const { open } = dialogState;
    // P-SHADCN-DIALOG-CONTENT-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(
      tw(
        'fixed left-1/2 top-1/2 grid w-full max-w-lg gap-4 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg duration-200 outline-none'
      )
    );

    def.rule({
      when: (w) => w.state(open).eq(true),
      intent: (i) => i.feedback.style.use(tw('animate-in fade-in-0 zoom-in-95')),
    });

    def.rule({
      when: (w) => w.state(open).eq(false),
      intent: (i) => i.feedback.style.use(tw('animate-out fade-out-0 zoom-out-95')),
    });
  },
});

/** P-SHADCN-DIALOG-CONTENT-DIRECT-ENTRY; parity is bounded by P-SHADCN-DIALOG-CONTENT-COMPATIBILITY-SUBSET. */

export default dialogContent;
