import { definePrototype, tw } from '@proto.ui/core';
import { asDropdownItem } from '@proto.ui/prototypes-base/dropdown';
import type { BrutalistDropdownItemExposes, BrutalistDropdownItemProps } from './types';

const ITEM_BASE_TOKENS =
  'relative flex w-full cursor-default select-none items-center gap-2 rounded-none bg-secondary-background px-2 py-1.5 text-left font-mono text-sm text-foreground outline-none';

const dropdownItem = definePrototype<BrutalistDropdownItemProps, BrutalistDropdownItemExposes>({
  name: 'brutalist-dropdown-item',
  setup(def) {
    def.props.define({
      inset: { type: 'boolean', empty: 'fallback' },
      variant: { type: 'enum', empty: 'fallback', options: ['default', 'destructive'] },
    });
    def.props.setDefaults({ inset: false, variant: 'default' });

    const itemState = asDropdownItem().stateHandles;
    if (!itemState) {
      throw new Error('[brutalist-dropdown-item] Dropdown Item must project command states.');
    }
    const { disabled, focused, focusVisible, pressed, active } = itemState;

    def.feedback.style.use(tw(ITEM_BASE_TOKENS));

    def.rule({
      when: (w) => w.prop('inset').eq(true),
      intent: (i) => i.feedback.style.use(tw('pl-8')),
    });

    // Destructive resting text pairing.
    def.rule({
      when: (w) => w.prop('variant').eq('destructive'),
      intent: (i) => i.feedback.style.use(tw('text-destructive')),
    });

    // Default variant: any interaction (active includes pointer.enter while the
    // menu is open, plus keyboard focus/press) highlights with the main pair.
    def.rule({
      when: (w) =>
        w.all(
          w.prop('variant').eq('default'),
          w.any(
            w.state(active).eq(true),
            w.state(focused).eq(true),
            w.state(focusVisible).eq(true),
            w.state(pressed).eq(true)
          )
        ),
      intent: (i) => i.feedback.style.use(tw('bg-main text-main-foreground')),
    });

    // Destructive variant: the same interaction states keep the destructive
    // pair instead of being overridden by the main accent (review defect:
    // white background with pale pink text under active/disabled).
    def.rule({
      when: (w) =>
        w.all(
          w.prop('variant').eq('destructive'),
          w.any(
            w.state(active).eq(true),
            w.state(focused).eq(true),
            w.state(focusVisible).eq(true),
            w.state(pressed).eq(true)
          )
        ),
      intent: (i) => i.feedback.style.use(tw('bg-destructive text-destructive-foreground')),
    });

    // Disabled retains an explicit paper + muted-foreground pair so the row is
    // never a blank white panel with un-paired text.
    def.rule({
      when: (w) => w.state(disabled).eq(true),
      intent: (i) =>
        i.feedback.style.use(
          tw('pointer-events-none bg-secondary-background text-muted-foreground')
        ),
    });
  },
});

export default dropdownItem;
