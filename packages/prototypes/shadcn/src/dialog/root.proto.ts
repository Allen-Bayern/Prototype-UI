import { definePrototype, tw } from '@proto.ui/core';
import { asDialogRoot } from '@proto.ui/prototypes-base';
import type { ShadcnDialogRootExposes, ShadcnDialogRootProps } from './types';

const dialogRoot = definePrototype<ShadcnDialogRootProps, ShadcnDialogRootExposes>({
  name: 'shadcn-dialog-root',
  setup(def) {
    // P-SHADCN-DIALOG-BASE-INHERITANCE, P-SHADCN-DIALOG-CURRENT-BASE-DEVIATIONS
    asDialogRoot();
    // P-SHADCN-DIALOG-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(tw('relative inline-flex items-start'));
  },
});

/** P-SHADCN-DIALOG-DIRECT-ENTRY; parity is bounded by P-SHADCN-DIALOG-COMPATIBILITY-SUBSET. */

export default dialogRoot;
