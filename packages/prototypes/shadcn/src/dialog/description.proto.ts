import { definePrototype, tw } from '@proto.ui/core';
import { asDialogDescription } from '@proto.ui/prototypes-base';
import type { ShadcnDialogDescriptionExposes, ShadcnDialogDescriptionProps } from './types';

const dialogDescription = definePrototype<
  ShadcnDialogDescriptionProps,
  ShadcnDialogDescriptionExposes
>({
  name: 'shadcn-dialog-description',
  setup(def) {
    // P-SHADCN-DIALOG-DESCRIPTION-BASE-INHERITANCE,
    // P-SHADCN-DIALOG-DESCRIPTION-CURRENT-VISUAL-SURFACE
    asDialogDescription();
    def.feedback.style.use(tw('text-sm text-muted-foreground'));
  },
});

/** P-SHADCN-DIALOG-DESCRIPTION-DIRECT-ENTRY; parity is bounded by P-SHADCN-DIALOG-DESCRIPTION-COMPATIBILITY-SUBSET. */

export default dialogDescription;
