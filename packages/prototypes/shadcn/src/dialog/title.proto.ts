import { definePrototype, tw } from '@proto.ui/core';
import { asDialogTitle } from '@proto.ui/prototypes-base';
import type { ShadcnDialogTitleExposes, ShadcnDialogTitleProps } from './types';

const dialogTitle = definePrototype<ShadcnDialogTitleProps, ShadcnDialogTitleExposes>({
  name: 'shadcn-dialog-title',
  setup(def) {
    // P-SHADCN-DIALOG-TITLE-BASE-INHERITANCE,
    // P-SHADCN-DIALOG-TITLE-CURRENT-VISUAL-SURFACE
    asDialogTitle();
    def.feedback.style.use(tw('text-lg font-semibold leading-none tracking-tight'));
  },
});

/** P-SHADCN-DIALOG-TITLE-DIRECT-ENTRY; parity is bounded by P-SHADCN-DIALOG-TITLE-COMPATIBILITY-SUBSET. */

export default dialogTitle;
