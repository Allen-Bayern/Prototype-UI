import { definePrototype, tw } from '@proto.ui/core';
import { asSelectContent } from '@proto.ui/prototypes-base/select';
import type { ShadcnSelectContentExposes, ShadcnSelectContentProps } from './types';

const selectContent = definePrototype<ShadcnSelectContentProps, ShadcnSelectContentExposes>({
  name: 'shadcn-select-content',
  setup(def) {
    // P-SHADCN-SELECT-CONTENT-POSITION-PROP
    def.props.define({
      position: {
        type: 'enum',
        empty: 'fallback',
        options: ['item-aligned', 'popper'],
      },
    });
    def.props.setDefaults({ position: 'item-aligned' });

    // P-SHADCN-SELECT-CONTENT-BASE-INHERITANCE,
    // P-SHADCN-SELECT-CONTENT-CURRENT-BASE-DEVIATIONS
    const select = asSelectContent();
    // P-SHADCN-SELECT-CONTENT-TRANSITION
    select.asTransition.configure({ enterDuration: 150, leaveDuration: 100 });
    const { open } = select.stateHandles;
    const { transitionState } = select.asTransition;

    // P-SHADCN-SELECT-CONTENT-CURRENT-VISUAL-SURFACE
    def.feedback.style.use(
      tw(
        'relative z-50 w-[var(--proto-ui-anchor-width)] min-w-[var(--proto-ui-anchor-width)] max-h-[var(--proto-ui-available-height)] overflow-x-hidden overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none transition-none duration-150'
      )
    );
    // P-SHADCN-SELECT-CONTENT-OPEN-AND-SIDE-STYLES
    def.rule({
      when: (w) =>
        w.any(w.state(transitionState).eq('entering'), w.state(transitionState).eq('entered')),
      intent: (i) => i.feedback.style.use(tw('animate-in fade-in-0 zoom-in-95')),
    });
    def.rule({
      when: (w) => w.state(open).eq(false),
      intent: (i) => i.feedback.style.use(tw('animate-out fade-out-0 zoom-out-95')),
    });
    def.rule({
      when: (w) => w.all(w.state(open).eq(true), w.prop('side').eq('bottom')),
      intent: (i) => i.feedback.style.use(tw('slide-in-from-top-2')),
    });
    def.rule({
      when: (w) => w.all(w.state(open).eq(true), w.prop('side').eq('top')),
      intent: (i) => i.feedback.style.use(tw('slide-in-from-bottom-2')),
    });
    def.rule({
      when: (w) => w.all(w.state(open).eq(true), w.prop('side').eq('left')),
      intent: (i) => i.feedback.style.use(tw('slide-in-from-right-2')),
    });
    def.rule({
      when: (w) => w.all(w.state(open).eq(true), w.prop('side').eq('right')),
      intent: (i) => i.feedback.style.use(tw('slide-in-from-left-2')),
    });
  },
});

/** P-SHADCN-SELECT-CONTENT-DIRECT-ENTRY; parity is bounded by P-SHADCN-SELECT-CONTENT-COMPATIBILITY-SUBSET. */

export default selectContent;
