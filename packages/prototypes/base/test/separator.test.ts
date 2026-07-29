import { describe, expect, expectTypeOf, it } from 'vitest';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';
import separatorRoot from '../src/separator';
import type { State } from '@proto.ui/core';
import type {
  SeparatorOrientation,
  SeparatorRootExposes,
  SeparatorRootStateHandles,
} from '../src/separator';

type StateValue<T> =
  T extends State<infer V> ? V : T extends { kind: 'state'; state: State<infer V> } ? V : never;

AdaptToWebComponent(separatorRoot);

describe('prototypes/base: separator', () => {
  it('preserves the orientation literal union across public state handles', () => {
    // T-BASE-SEPARATOR-0001-CASE-TYPED-ORIENTATION
    expectTypeOf<
      StateValue<SeparatorRootExposes['orientation']>
    >().toEqualTypeOf<SeparatorOrientation>();
    expectTypeOf<
      StateValue<SeparatorRootStateHandles['orientation']>
    >().toEqualTypeOf<SeparatorOrientation>();
  });

  it('defaults to a decorative horizontal separator without interaction', async () => {
    // T-BASE-SEPARATOR-0001-CASE-DEFAULTS
    const el = document.createElement('base-separator-root');
    document.body.appendChild(el);
    await Promise.resolve();

    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('hidden')).toBe(false);
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.tabIndex).toBe(-1);
    el.remove();
  });

  it('updates semantic orientation and decorative tree state after mount', async () => {
    // T-BASE-SEPARATOR-0001-CASE-DYNAMIC-SEMANTICS
    const el = document.createElement('base-separator-root');
    document.body.appendChild(el);
    await Promise.resolve();

    setElementProps(el, { decorative: false, orientation: 'vertical' });
    await Promise.resolve();
    await Promise.resolve();
    expect(el.getAttribute('role')).toBe('separator');
    expect(el.getAttribute('aria-orientation')).toBe('vertical');
    expect(el.getAttribute('aria-hidden')).toBe('false');
    expect(el.tabIndex).toBe(-1);

    setElementProps(el, { decorative: true, orientation: 'horizontal' });
    await Promise.resolve();
    await Promise.resolve();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.tabIndex).toBe(-1);
    el.remove();
  });
});
