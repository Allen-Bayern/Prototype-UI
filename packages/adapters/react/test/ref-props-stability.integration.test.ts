import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { definePrototype, tw } from '@proto.ui/core';

import { createReactAdapter } from '../src';

const mountedRoots: Array<{ unmount(): void }> = [];
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

afterEach(async () => {
  for (const root of mountedRoots.splice(0)) {
    await act(async () => root.unmount());
  }
  document.body.replaceChildren();
});

describe('adapter-react: ref props stability', () => {
  it('does not treat React 19 forwardRef props cloning as a raw-props update loop', async () => {
    const proto = definePrototype<{ tone?: 'base' | 'accent' }>({
      name: 'react-ref-props-stability',
      setup(def) {
        def.props.define({
          tone: { type: 'enum', options: ['base', 'accent'] },
        });
        def.props.setDefaults({ tone: 'base' });
        def.feedback.style.use(tw('base-token'));
        def.rule({
          when: (w) => w.prop('tone').eq('accent'),
          intent: (i) => i.feedback.style.use(tw('accent-token')),
        });
        return (renderer) => renderer.r.slot();
      },
    });

    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    mountedRoots.push(root);
    const Component = createReactAdapter(React)(proto);
    const ref = React.createRef<React.ComponentRef<typeof Component>>();

    await act(async () => {
      root.render(React.createElement(Component, { ref, tone: 'base' }, 'content'));
      await Promise.resolve();
    });

    const element = host.querySelector<HTMLElement>('[data-pui-root]');
    expect(ref.current?.getExposes).toBeTypeOf('function');
    expect(element?.getAttribute('data-pui-style')).toContain('base-token');

    await act(async () => {
      root.render(React.createElement(Component, { ref, tone: 'accent' }, 'content'));
      await Promise.resolve();
    });

    expect(element?.getAttribute('data-pui-style')).toContain('accent-token');
  });
});
