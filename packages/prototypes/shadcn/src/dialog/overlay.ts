import { definePrototype, tw } from '@proto.ui/core';
import { asDialogMask } from '@proto.ui/prototypes-base';
import type { ShadcnDialogMaskExposes, ShadcnDialogMaskProps } from './types';

const dialogMask = definePrototype<ShadcnDialogMaskExposes, ShadcnDialogMaskProps>({
  name: 'shadcn-dialog-mask',
  setup(def) {
    const dialogState = asDialogMask().stateHandles;
    if (!dialogState) {
      throw new Error('[shadcn-dialog-mask] asDialogMask must project Dialog mask state handles.');
    }
    const { open } = dialogState;
    def.feedback.style.use(tw('fixed inset-0 bg-black/50'));

    def.rule({
      when: (w) => w.state(open).eq(true),
      intent: (i) => i.feedback.style.use(tw('animate-in fade-in-0')),
    });

    def.rule({
      when: (w) => w.state(open).eq(false),
      intent: (i) => i.feedback.style.use(tw('animate-out fade-out-0')),
    });
  },
});

export default dialogMask;
