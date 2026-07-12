import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';
import { asTransition, type TransitionProps } from '@proto.ui/prototypes-base';

import { createMountedVueAdapter, flushVue } from './utils/vue';

function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc != null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

async function callControl(mounted: ReturnType<typeof createMountedVueAdapter>, path: string) {
  const vm = mounted.vm;
  vm.invokeInCallbackScope(() => {
    const fn = resolvePath(vm.getExposes(), path);
    if (typeof fn === 'function') fn();
  });
  vm.update?.();
  await flushVue();
}

function readTransitionState(mounted: ReturnType<typeof createMountedVueAdapter>) {
  const getter = resolvePath(mounted.vm.getExposes(), 'transitionState.get');
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

describe('adapter-vue: Transition and ViewIntent', () => {
  it('keeps the same view while a leaving phase is reversed', async () => {
    const mounted = createMountedVueAdapter(
      createTransitionProto('vue-transition-reverse') as any,
      { open: true, appear: false }
    );

    try {
      await flushVue();
      const firstRoot = mounted.host.firstElementChild;
      expect(firstRoot).not.toBeNull();

      await callControl(mounted, 'controls.leave');
      expect(readTransitionState(mounted)).toBe('leaving');
      expect(mounted.host.firstElementChild).toBe(firstRoot);

      await callControl(mounted, 'controls.enter');
      expect(readTransitionState(mounted)).toBe('entering');
      expect(mounted.host.firstElementChild).toBe(firstRoot);
    } finally {
      mounted.unmount();
    }
  });

  it('detaches only after leave completion and rematerializes before entering', async () => {
    const mounted = createMountedVueAdapter(
      createTransitionProto('vue-transition-rematerialize') as any,
      { open: true, appear: false }
    );

    try {
      await flushVue();
      const firstRoot = mounted.host.firstElementChild;

      await callControl(mounted, 'controls.leave');
      expect(mounted.host.firstElementChild).toBe(firstRoot);

      await callControl(mounted, 'controls.complete');
      await flushVue();
      expect(readTransitionState(mounted)).toBe('closed');
      expect(mounted.host.firstElementChild).toBeNull();

      expect(typeof resolvePath(mounted.vm.getExposes(), 'controls.enter')).toBe('function');
      await callControl(mounted, 'controls.enter');
      expect(readTransitionState(mounted)).toBe('entering');

      await flushVue();
      expect(mounted.host.firstElementChild).not.toBeNull();
      expect(mounted.host.firstElementChild).not.toBe(firstRoot);
      expect(readTransitionState(mounted)).toBe('entering');
    } finally {
      mounted.unmount();
    }
  });
});
