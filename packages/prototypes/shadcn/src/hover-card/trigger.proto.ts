import { definePrototype, tw } from '@proto.ui/core';
import { asHoverCardTrigger } from '@proto.ui/prototypes-base';
import type { ShadcnHoverCardTriggerExposes, ShadcnHoverCardTriggerProps } from './types';

const TRIGGER_BASE_TOKENS =
  'inline-flex cursor-pointer items-center text-sm font-medium underline-offset-4 outline-none';

const hoverCardTrigger = definePrototype<
  ShadcnHoverCardTriggerProps,
  ShadcnHoverCardTriggerExposes
>({
  name: 'shadcn-hover-card-trigger',
  setup(def) {
    const hoverCard = asHoverCardTrigger();
    const state = hoverCard.stateHandles;
    if (!state) {
      throw new Error('[shadcn-hover-card-trigger] missing Hover Card Trigger state handles.');
    }
    const { disabled, hovered, focusVisible } = state;

    def.feedback.style.use(tw(TRIGGER_BASE_TOKENS));

    def.rule({
      when: (w) => w.state(hovered).eq(true),
      intent: (i) => i.feedback.style.use(tw('underline')),
    });

    def.rule({
      when: (w) => w.state(focusVisible).eq(true),
      intent: (i) => i.feedback.style.use(tw('ring-2 ring-ring ring-offset-2')),
    });

    def.rule({
      when: (w) => w.state(disabled).eq(true),
      intent: (i) => i.feedback.style.use(tw('pointer-events-none opacity-50')),
    });
  },
});

export default hoverCardTrigger;
