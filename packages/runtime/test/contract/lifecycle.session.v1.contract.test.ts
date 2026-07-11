import { describe, expect, it } from 'vitest';
import type { OwnedStateHandle, Prototype } from '@proto.ui/core';
import { createRuntimeSession, type RuntimeHost, type RuntimeLifecycleEvent } from '../../src';

function createHost(events: RuntimeLifecycleEvent[]) {
  const scheduled: Array<() => void> = [];
  const commits: unknown[] = [];
  const host: RuntimeHost<any> = {
    prototypeName: 'lifecycle-session-v1',
    getRawProps: () => ({}),
    commit(children, signal) {
      commits.push(children);
      signal?.done();
    },
    schedule(task) {
      scheduled.push(task);
    },
    onLifecycleEvent(event) {
      events.push(event);
    },
  };
  return { host, scheduled, commits };
}

describe('runtime contract: repeatable lifecycle session (v1)', () => {
  it('runs setup/created once, mount callbacks per epoch, and terminal dispose once', async () => {
    const events: RuntimeLifecycleEvent[] = [];
    const { host, scheduled } = createHost(events);
    const callbacks: string[] = [];
    let setupCount = 0;
    let state!: OwnedStateHandle<number>;

    const proto: Prototype = {
      name: 'lifecycle-session-v1',
      setup(def) {
        setupCount++;
        state = def.state.numberDiscrete('count', 0);
        def.lifecycle.onCreated(() => callbacks.push('created'));
        def.lifecycle.onMounted(() => callbacks.push(`mounted:${state.get()}`));
        def.lifecycle.onUnmounted(() => {
          callbacks.push(`unmounted:${state.get()}`);
          state.set(state.get() + 1, 'test: increment per detached epoch');
        });
        def.lifecycle.onBeforeDispose(() => callbacks.push(`beforeDispose:${state.get()}`));
        return (r) => [r.el('div', String(state.get()))];
      },
    };

    const session = createRuntimeSession(proto, host);
    expect(session.instancePhase).toBe('alive');
    expect(session.mountPhase).toBe('detached');
    expect(setupCount).toBe(1);
    expect(callbacks).toEqual(['created']);

    const firstMount = session.mount();
    expect(session.mountEpoch).toBe(1);
    expect(session.mountPhase).toBe('mounted');
    expect(callbacks).toEqual(['created']);
    scheduled.shift()!();
    await firstMount;
    expect(session.mountPhase).toBe('mounted');

    await session.unmount();
    expect(session.mountPhase).toBe('detached');
    expect(state.get()).toBe(1);

    const secondMount = session.mount();
    scheduled.shift()!();
    await secondMount;
    expect(session.mountEpoch).toBe(2);

    await session.dispose();
    expect(session.instancePhase).toBe('disposed');
    expect(session.mountPhase).toBe('detached');
    expect(setupCount).toBe(1);
    expect(callbacks).toEqual([
      'created',
      'mounted:0',
      'unmounted:0',
      'mounted:1',
      'unmounted:1',
      'beforeDispose:2',
    ]);
    expect(() => state.get()).toThrow(/disposed/i);

    expect(events.filter((event) => event.type === 'mount.mounted')).toEqual([
      { type: 'mount.mounted', epoch: 1 },
      { type: 'mount.mounted', epoch: 2 },
    ]);
    expect(events.filter((event) => event.type === 'unmount.done')).toEqual([
      { type: 'unmount.done', epoch: 1 },
      { type: 'unmount.done', epoch: 2 },
    ]);
  });

  it('marks detached updates dirty and renders latest state on the next mount', async () => {
    const events: RuntimeLifecycleEvent[] = [];
    const { host, scheduled, commits } = createHost(events);
    let renders = 0;

    const proto: Prototype = {
      name: 'lifecycle-session-dirty',
      setup() {
        return (r) => {
          renders++;
          return [r.el('div', String(renders))];
        };
      },
    };

    const session = createRuntimeSession(proto, host);
    session.controller.update();
    session.controller.update();
    expect(renders).toBe(0);

    const firstMount = session.mount();
    scheduled.shift()!();
    await firstMount;
    expect(renders).toBe(1);
    expect(commits).toHaveLength(1);

    await session.unmount();
    session.controller.update();
    expect(renders).toBe(1);

    const secondMount = session.mount();
    scheduled.shift()!();
    await secondMount;
    expect(renders).toBe(2);
    expect(commits).toHaveLength(2);
  });

  it('invalidates a scheduled mounted callback when the epoch unmounts first', async () => {
    const events: RuntimeLifecycleEvent[] = [];
    const { host, scheduled } = createHost(events);
    const callbacks: string[] = [];

    const proto: Prototype = {
      name: 'lifecycle-session-cancel-mount',
      setup(def) {
        def.lifecycle.onMounted(() => callbacks.push('mounted'));
        def.lifecycle.onUnmounted(() => callbacks.push('unmounted'));
      },
    };

    const session = createRuntimeSession(proto, host);
    const mounting = session.mount();
    expect(scheduled).toHaveLength(1);

    await session.unmount();
    scheduled.shift()!();
    await mounting;

    expect(callbacks).toEqual(['unmounted']);
    expect(session.mountPhase).toBe('detached');
    expect(events.some((event) => event.type === 'mount.mounted')).toBe(false);
  });
});
