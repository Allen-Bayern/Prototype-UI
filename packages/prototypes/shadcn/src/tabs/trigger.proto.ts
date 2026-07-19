import { definePrototype, tw } from '@proto.ui/core';
import { asTabsTrigger } from '@proto.ui/prototypes-base/tabs';
import type { ShadcnTabsTriggerExposes, ShadcnTabsTriggerProps } from './types';

const BASE_TOKENS = [
  'inline-flex',
  'items-center',
  'justify-center',
  'whitespace-nowrap',
  'rounded-lg',
  'border',
  'border-transparent',
  'px-3',
  'py-1.5',
  'text-sm',
  'font-medium',
  'transition-all',
  'outline-none',
  'text-muted-foreground',
  'select-none',
].join(' ');

const tabsTrigger = definePrototype<ShadcnTabsTriggerProps, ShadcnTabsTriggerExposes>({
  name: 'shadcn-tabs-trigger',
  setup(def) {
    // P-SHADCN-TABS-TRIGGER-BASE-INHERITANCE,
    // P-SHADCN-TABS-TRIGGER-CURRENT-BASE-DEVIATIONS
    const triggerState = asTabsTrigger().stateHandles;
    if (!triggerState) {
      throw new Error(
        '[shadcn-tabs-trigger] asTabsTrigger must project Tabs trigger state handles.'
      );
    }
    const { disabled, hovered, focusVisible, pressed, selected } = triggerState;

    // P-SHADCN-TABS-TRIGGER-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(tw(BASE_TOKENS));

    // P-SHADCN-TABS-TRIGGER-STATE-DRIVEN-STYLES
    def.rule({
      when: (w) => w.state(focusVisible).eq(true),
      intent: (i) =>
        i.feedback.style.use(
          tw(
            'bg-background text-foreground shadow-xs ring-3 ring-ring/50 ring-offset-2 ring-offset-background'
          )
        ),
    });

    def.rule({
      when: (w) => w.state(selected).eq(true),
      intent: (i) => i.feedback.style.use(tw('bg-background text-foreground shadow-xs')),
    });

    def.rule({
      when: (w) => w.all(w.state(hovered).eq(true), w.state(selected).eq(false)),
      intent: (i) => i.feedback.style.use(tw('bg-background/70 text-foreground shadow-xs')),
    });

    def.rule({
      when: (w) => w.state(pressed).eq(true),
      intent: (i) =>
        i.feedback.style.use(tw('scale-[0.99] bg-background text-foreground shadow-xs')),
    });

    def.rule({
      when: (w) => w.state(disabled).eq(true),
      intent: (i) => i.feedback.style.use(tw('pointer-events-none opacity-50')),
    });
  },
});

/** P-SHADCN-TABS-TRIGGER-DIRECT-ENTRY; parity remains bounded by P-SHADCN-TABS-TRIGGER-COMPATIBILITY-SUBSET. */

export default tabsTrigger;
