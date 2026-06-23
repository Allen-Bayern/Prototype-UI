import { describe, it, expect } from 'vitest';
import { createContextKey, type Prototype } from '@proto.ui/core';
import { AdaptToWebComponent } from '@proto.ui/adapter-web-component';

const KEY = createContextKey<{ value: number }>('ctx-state-sync');

describe('contract: adapter-web-component / context callback may set local state (v0)', () => {
  it('context.subscribe callback runs with a usable run handle and may call state.set', async () => {
    const seen: number[] = [];

    const P: Prototype = {
      name: 'x-context-state-sync-1',
      setup(def) {
        const local = def.state.numberDiscrete('local', 0);
        def.context.provide(KEY, { value: 0 });

        def.context.subscribe(KEY, (_run, next) => {
          local.set(next.value, 'reason: context.subscribe => local');
          seen.push(local.get());
        });

        def.lifecycle.onMounted((run) => {
          run.context.update(KEY, { value: 1 });
          run.context.update(KEY, { value: 2 });
        });

        def.expose.state('local', local);
        return (r) => [r.el('div', 'ok')];
      },
    };

    AdaptToWebComponent(P);

    const el = document.createElement('x-context-state-sync-1') as any;
    document.body.appendChild(el);

    await Promise.resolve();
    await Promise.resolve();

    expect(seen).toEqual([1, 2]);
    expect(el.getExposes().local.get()).toBe(2);

    el.remove();
    await Promise.resolve();
  });
});
