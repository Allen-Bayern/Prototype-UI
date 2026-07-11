import { describe, expect, it, vi } from 'vitest';
import { definePrototype } from '@proto.ui/core';
import { createAdapterHost } from '../src';

describe('adapter-base: adapter host', () => {
  it('can create an alive detached session without performing the first mount', async () => {
    const commit = vi.fn((_children, signal) => signal?.done());
    const proto = definePrototype({
      name: 'x-manual-adapter-host',
      setup(def) {
        def.lifecycle.onCreated((run) => run.lifecycle.setPresent(false));
        return (renderer) => renderer.el('div', 'ok');
      },
    });

    const host = createAdapterHost(
      proto,
      {
        getRawProps: () => ({}),
        schedule: (task) => task(),
        commit,
      },
      {},
      { initialMount: 'manual' }
    );

    expect(host.viewIntent.getSnapshot()).toEqual({ present: false, version: 1 });
    expect(commit).not.toHaveBeenCalled();

    await host.mount();
    expect(commit).toHaveBeenCalledOnce();

    await host.dispose();
  });
});
