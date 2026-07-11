import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';
import { asTransition, type TransitionProps } from '@proto.ui/hooks';

import { createMountedReactAdapter } from './utils/fake-react';

function call(mounted: ReturnType<typeof createMountedReactAdapter>, path: string) {
  const handle = mounted.ref.current;
  handle.invokeInCallbackScope(() => {
    const value = path
      .split('.')
      .reduce<any>((current, key) => current?.[key], handle.getExposes());
    value?.();
  });
  handle.update();
}

describe('adapter-react: repeatable Proto mount epochs', () => {
  it('rebinds a fresh host root without rerunning setup or disposing instance state', async () => {
    const originalRaf = globalThis.requestAnimationFrame;
    const originalCancelRaf = globalThis.cancelAnimationFrame;
    let sequence = 0;
    const frames = new Map<number, FrameRequestCallback>();
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      const id = ++sequence;
      frames.set(id, cb);
      return id;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((id: number) =>
      frames.delete(id)) as typeof cancelAnimationFrame;

    const calls = { setup: 0, created: 0, mounted: 0, unmounted: 0, disposed: 0 };
    const proto = definePrototype<TransitionProps>({
      name: 'react-repeatable-mount-epochs',
      setup(def) {
        calls.setup += 1;
        asTransition();
        def.lifecycle.onCreated(() => (calls.created += 1));
        def.lifecycle.onMounted(() => (calls.mounted += 1));
        def.lifecycle.onUnmounted(() => (calls.unmounted += 1));
        def.lifecycle.onBeforeDispose(() => (calls.disposed += 1));
        return (run) => run.el('div', 'ok');
      },
    });

    const mounted = createMountedReactAdapter(proto as any, { open: true, appear: false });
    try {
      call(mounted, 'controls.complete');
      const firstRoot = mounted.root;
      const host = firstRoot?.parentElement;

      call(mounted, 'controls.leave');
      call(mounted, 'controls.complete');
      while (frames.size > 0) {
        const [id, frame] = frames.entries().next().value!;
        frames.delete(id);
        frame(16.7);
      }
      mounted.update();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(host?.firstElementChild).toBeNull();
      expect(calls).toMatchObject({ setup: 1, created: 1, mounted: 1, unmounted: 1, disposed: 0 });

      call(mounted, 'controls.enter');
      await Promise.resolve();
      await Promise.resolve();
      mounted.update();
      while (frames.size > 0) {
        const [id, frame] = frames.entries().next().value!;
        frames.delete(id);
        frame(33.4);
        mounted.update();
      }
      await Promise.resolve();

      expect(host?.firstElementChild).not.toBeNull();
      expect(host?.firstElementChild).not.toBe(firstRoot);
      expect(calls).toMatchObject({ setup: 1, created: 1, mounted: 2, unmounted: 1, disposed: 0 });
    } finally {
      mounted.unmount();
      globalThis.requestAnimationFrame = originalRaf;
      globalThis.cancelAnimationFrame = originalCancelRaf;
    }

    await Promise.resolve();
    expect(calls.disposed).toBe(1);
  });
});
