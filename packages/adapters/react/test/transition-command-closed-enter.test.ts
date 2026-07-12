import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';
import { asTransition, type TransitionProps } from '@proto.ui/hooks';

import { createMountedReactAdapter } from './utils/fake-react';

function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function callControl(mounted: ReturnType<typeof createMountedReactAdapter>, path: string) {
  const handle = mounted.ref.current;
  handle.invokeInCallbackScope(() => {
    const fn = resolvePath(handle.getExposes(), path);
    if (typeof fn === 'function') fn();
  });
  handle.update();
  mounted.update();
}

function readTransitionState(mounted: ReturnType<typeof createMountedReactAdapter>) {
  const getter = resolvePath(mounted.ref.current.getExposes(), 'transitionState.get');
  return typeof getter === 'function' ? getter() : undefined;
}

function createTransitionProto(name: string) {
  return definePrototype<TransitionProps>({
    name,
    setup() {
      asTransition();
      return (r) => [r.el('div', 'ok')];
    },
  });
}

describe('adapter-react: Transition and ViewIntent', () => {
  it('keeps the same view while a leaving phase is reversed', () => {
    const mounted = createMountedReactAdapter(
      createTransitionProto('react-transition-reverse') as any,
      { open: true, appear: false },
      {},
      { context: true }
    );

    try {
      callControl(mounted, 'controls.complete');
      const firstRoot = mounted.root;
      expect(firstRoot).not.toBeNull();

      callControl(mounted, 'controls.leave');
      expect(readTransitionState(mounted)).toBe('leaving');
      expect(mounted.root).toBe(firstRoot);

      callControl(mounted, 'controls.enter');
      expect(readTransitionState(mounted)).toBe('entering');
      expect(mounted.root).toBe(firstRoot);
    } finally {
      mounted.unmount();
    }
  });

  it('detaches only after leave completion and rematerializes before entering', async () => {
    const mounted = createMountedReactAdapter(
      createTransitionProto('react-transition-rematerialize') as any,
      { open: true, appear: false },
      {},
      { context: true }
    );

    try {
      callControl(mounted, 'controls.complete');
      const firstRoot = mounted.root;
      const host = firstRoot?.parentElement;
      callControl(mounted, 'controls.leave');
      expect(mounted.root).toBe(firstRoot);

      callControl(mounted, 'controls.complete');
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      mounted.update();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
      expect(readTransitionState(mounted)).toBe('closed');
      expect(host?.firstElementChild).toBeNull();

      expect(typeof resolvePath(mounted.ref.current.getExposes(), 'controls.enter')).toBe(
        'function'
      );
      callControl(mounted, 'controls.enter');
      expect(readTransitionState(mounted)).toBe('entering');

      await Promise.resolve();
      mounted.update();
      expect(host?.firstElementChild).not.toBeNull();
      expect(host?.firstElementChild).not.toBe(firstRoot);
      expect(readTransitionState(mounted)).toBe('entering');
    } finally {
      mounted.unmount();
    }
  });
});
