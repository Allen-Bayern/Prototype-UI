import { compareLoweredVariants } from '@proto.ui/module-rule-expose-state-web';
import { describe, expect, it } from 'vitest';

import { compareVariants } from '../src/services/prototype-style-tokens';

// The extractor writes the stylesheet ahead of time and the runtime writes the
// class onto the host. `data-pui-style~="…"` matches whole words, so the two
// orderings are one contract with two implementations.
const VARIANT_LISTS = [
  ['data-[hovered]', 'not-[data-selected]', 'not-[data-pressed]'],
  ['data-[hovered]', 'not-[data-pressed]', 'not-[data-selected]'],
  ['data-[hovered]', 'not-[data-active]', 'not-[data-pressed]'],
  ['not-[data-checked]', 'dark'],
  ['disabled', 'hover', 'dark'],
  ['data-[selected]', 'not-[data-pressed]'],
  ['focus-visible', 'data-[orientation=vertical]'],
];

describe('lowered variant order', () => {
  it('orders variants the same way in the runtime and the extractor', () => {
    for (const variants of VARIANT_LISTS) {
      expect([...variants].sort(compareLoweredVariants), variants.join(' + ')).toEqual(
        [...variants].sort(compareVariants)
      );
    }
  });

  it('is stable under the authoring order of the same conditions', () => {
    const authored = ['data-[hovered]', 'not-[data-selected]', 'not-[data-pressed]'];
    const reordered = ['not-[data-pressed]', 'data-[hovered]', 'not-[data-selected]'];
    expect([...authored].sort(compareLoweredVariants).join(':')).toBe(
      [...reordered].sort(compareLoweredVariants).join(':')
    );
  });

  it('keeps the Brutalist Tabs trigger hover class the extractor emits', () => {
    // The authored order is hovered, selected, pressed; the stylesheet carries
    // hovered, pressed, selected. Before the shared ordering the runtime wrote
    // the first and no rule ever matched.
    expect(
      ['data-[hovered]', 'not-[data-selected]', 'not-[data-pressed]']
        .sort(compareLoweredVariants)
        .join(':')
    ).toBe('data-[hovered]:not-[data-pressed]:not-[data-selected]');
  });
});
