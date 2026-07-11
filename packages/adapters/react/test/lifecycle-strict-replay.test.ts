import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';

import { createMountedReactAdapter } from './utils/fake-react';

describe('adapter-react: StrictMode lifecycle replay', () => {
  it('replays view epochs without disposing or recreating the Proto instance', async () => {
    const calls = { setup: 0, created: 0, mounted: 0, unmounted: 0, disposed: 0 };
    const proto = definePrototype({
      name: 'react-strict-view-epoch-replay',
      setup(def) {
        calls.setup += 1;
        def.lifecycle.onCreated(() => (calls.created += 1));
        def.lifecycle.onMounted(() => (calls.mounted += 1));
        def.lifecycle.onUnmounted(() => (calls.unmounted += 1));
        def.lifecycle.onBeforeDispose(() => (calls.disposed += 1));
        return (run) => run.el('div', 'ok');
      },
    });

    const mounted = createMountedReactAdapter(proto);
    expect(calls).toEqual({ setup: 1, created: 1, mounted: 1, unmounted: 0, disposed: 0 });

    mounted.replayLayoutEffects();
    await Promise.resolve();

    expect(calls).toEqual({ setup: 1, created: 1, mounted: 2, unmounted: 1, disposed: 0 });

    mounted.unmount();
    await Promise.resolve();
    expect(calls).toEqual({ setup: 1, created: 1, mounted: 2, unmounted: 2, disposed: 1 });
  });
});
