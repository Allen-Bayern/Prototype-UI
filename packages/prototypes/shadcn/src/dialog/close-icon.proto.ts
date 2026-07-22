import { definePrototype, tw } from '@proto.ui/core';
import { asDialogClose } from '@proto.ui/prototypes-base/dialog';
import type { ShadcnDialogCloseExposes, ShadcnDialogCloseProps } from './types';

const dialogCloseIcon = definePrototype<ShadcnDialogCloseProps, ShadcnDialogCloseExposes>({
  name: 'shadcn-dialog-close-icon',
  setup(def) {
    const state = asDialogClose().stateHandles;
    if (!state) throw new Error('[shadcn-dialog-close-icon] command states are required.');
    const { disabled, hovered, focusVisible } = state;

    def.a11y.name('Close');
    def.feedback.style.use(
      tw(
        'absolute right-0 top-4 inline-flex size-8 items-center justify-center rounded-sm transition-all outline-none'
      )
    );
    def.rule({
      when: (w) => w.state(hovered).eq(true),
      intent: (i) => i.feedback.style.use(tw('bg-muted')),
    });
    def.rule({
      when: (w) => w.state(focusVisible).eq(true),
      intent: (i) => i.feedback.style.use(tw('ring-3 ring-ring/50')),
    });
    def.rule({
      when: (w) => w.state(disabled).eq(true),
      intent: (i) => i.feedback.style.use(tw('pointer-events-none opacity-50')),
    });

    return (renderer) => [
      renderer.r.slot(),
      renderer.svg.root(
        {
          viewBox: '0 0 24 24',
          width: 16,
          height: 16,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
        [renderer.svg.path({ d: 'M18 6 6 18' }), renderer.svg.path({ d: 'm6 6 12 12' })]
      ),
    ];
  },
});

export default dialogCloseIcon;
