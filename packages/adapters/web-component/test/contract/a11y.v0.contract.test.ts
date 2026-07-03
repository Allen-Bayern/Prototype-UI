import { describe, expect, it } from 'vitest';
import type { Prototype } from '@proto.ui/core';
import { definePrototype } from '@proto.ui/core';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';

describe('contract: adapter-web-component / a11y projection (v0)', () => {
  it('A11Y-WC-0100: projects supported semantic object IR to host attributes', () => {
    // T-A11Y-0001-CASE-WEB-PROJECTION
    const P: Prototype<{ disabled?: boolean }> = definePrototype({
      name: 'x-a11y-wc-projection',
      setup(def) {
        def.props.define({
          disabled: { type: 'boolean', empty: 'fallback' },
        });
        def.props.setDefaults({ disabled: false });

        const disabled = def.state.bool('button.disabled', false);
        def.a11y.role('button');
        def.a11y.name('Save');
        def.a11y.description('Stores changes');
        def.a11y.state('disabled', disabled);
        def.a11y.action('activate', { event: 'click' });
        def.a11y.tree({ mergeChildren: true });
        def.props.watch(['disabled'], (_run, next) => {
          disabled.set(next.disabled);
        });

        return (r) => r.el('button', 'Save');
      },
    });

    if (!customElements.get(P.name)) {
      customElements.define(
        P.name,
        AdaptToWebComponent(P, { register: false, registerAs: P.name })
      );
    }

    const el = document.createElement(P.name) as HTMLElement;
    document.body.appendChild(el);

    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('aria-label')).toBe('Save');
    expect(el.getAttribute('aria-description')).toBe('Stores changes');
    expect(el.getAttribute('aria-disabled')).toBe('false');
    expect(el.getAttribute('data-pui-a11y-actions')).toBe('activate');
    expect(el.getAttribute('data-pui-a11y-merge-children')).toBe('true');

    setElementProps(el, { disabled: true });

    expect(el.getAttribute('aria-disabled')).toBe('true');
  });
});
