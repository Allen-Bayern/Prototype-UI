import { definePrototype, tw } from '@proto.ui/core';
import { asSeparatorRoot } from '@proto.ui/prototypes-base/separator';
import type { BrutalistSeparatorRootExposes, BrutalistSeparatorRootProps } from './types';

export const BrutalistSeparatorRoot = definePrototype<
  BrutalistSeparatorRootProps,
  BrutalistSeparatorRootExposes
>({
  name: 'brutalist-separator-root',
  setup(def) {
    // Keep Base semantics (orientation/decorative/a11y) via as-hook.
    asSeparatorRoot();
    def.feedback.style.use(tw('block shrink-0 bg-foreground'));
    // Drive geometry from props so tokens apply directly instead of depending on
    // optimized data-[orientation=...] variants for this foundation slice.
    def.rule({
      when: (w) => w.prop('orientation').eq('horizontal'),
      intent: (i) => i.feedback.style.use(tw('h-0.5 w-full')),
    });
    def.rule({
      when: (w) => w.prop('orientation').eq('vertical'),
      intent: (i) => i.feedback.style.use(tw('h-12 w-0.5')),
    });
  },
});
