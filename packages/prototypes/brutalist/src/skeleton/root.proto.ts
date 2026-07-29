import { definePrototype, tw } from '@proto.ui/core';
import { asSkeletonRoot } from '@proto.ui/prototypes-base/skeleton';
import type { BrutalistSkeletonRootExposes, BrutalistSkeletonRootProps } from './types';

export const BrutalistSkeletonRoot = definePrototype<
  BrutalistSkeletonRootProps,
  BrutalistSkeletonRootExposes
>({
  name: 'brutalist-skeleton-root',
  setup(def) {
    // P-BRUTALIST-SKELETON-BASE-INHERITANCE
    asSkeletonRoot();
    // P-BRUTALIST-SKELETON-CONSUMER-SIZE — the consuming composition owns dimensions.
    // P-BRUTALIST-SKELETON-VISUAL-GRAMMAR
    def.feedback.style.use(
      tw(
        'block rounded-none border-2 border-foreground bg-lavender shadow-[2px_2px_0_0_var(--pui-foreground)]'
      )
    );
    return () => null;
  },
});
