import { describe, it, expect } from 'vitest';
import { createHostWiring } from '../src/wiring/host-wiring';

function fakeWiring(controllers: Record<string, any>) {
  return {
    attach(name: string, entries: any) {
      const c = controllers[name];
      if (!c) return false;
      c.attach(entries);
      return true;
    },
    reset(name?: string) {
      if (!name) {
        for (const c of Object.values(controllers)) {
          c.reset();
        }
        return;
      }
      const c = controllers[name];
      if (!c) return;
      c.reset();
    },
  };
}

describe('adapter-base: host-wiring', () => {
  it('afterUnmount swallows reset errors and clears controllers (idempotent)', () => {
    const wiring = createHostWiring({
      prototypeName: 'x-proto',
      modules: {
        props: () => [] as const,
        feedback: () => [] as const,
      },
    });

    const calls: string[] = [];

    const props = {
      attach() {
        calls.push('props.attach');
      },
      reset() {
        calls.push('props.reset');
        throw new Error('boom');
      },
    };

    const feedback = {
      attach() {
        calls.push('feedback.attach');
      },
      reset() {
        calls.push('feedback.reset');
      },
    };

    wiring.onRuntimeReady(fakeWiring({ props, feedback }) as any);

    expect(() => wiring.afterUnmount()).not.toThrow();
    expect(calls).toEqual(['props.attach', 'feedback.attach', 'props.reset', 'feedback.reset']);

    // Must be idempotent: second call should do nothing, must not throw.
    expect(() => wiring.afterUnmount()).not.toThrow();
    expect(calls).toEqual(['props.attach', 'feedback.attach', 'props.reset', 'feedback.reset']);
  });

  it('onRuntimeReady ignores missing controllers', () => {
    const wiring = createHostWiring({
      prototypeName: 'x-proto',
      modules: {
        props: () => [] as const,
        feedback: () => [] as const,
      },
    });

    const calls: string[] = [];
    const props = {
      attach() {
        calls.push('props.attach');
      },
      reset() {
        calls.push('props.reset');
      },
    };

    // feedback controller missing
    expect(() => wiring.onRuntimeReady(fakeWiring({ props }) as any)).not.toThrow();
    expect(() => wiring.afterUnmount()).not.toThrow();

    expect(calls).toEqual(['props.attach', 'props.reset']);
  });

  it('calls provide once per module and attaches returned partial', () => {
    let called = 0;

    const wiring = createHostWiring({
      prototypeName: 'x-proto',
      modules: {
        props: ({ prototypeName }) => {
          called++;
          return { foo: prototypeName, n: called } as any;
        },
      },
    });

    let attached: any = null;

    const props = {
      attach(p: any) {
        attached = p;
      },
      reset() {},
    };

    wiring.onRuntimeReady(fakeWiring({ props }) as any);

    expect(called).toBe(1);
    expect(attached).toEqual({ foo: 'x-proto', n: 1 });
  });

  it('rebinds a new view capability set without resetting logical module state', () => {
    const attached: unknown[] = [];
    let resets = 0;
    const wiring = createHostWiring({
      prototypeName: 'x-repeatable-view',
      modules: { context: () => [['view', 'first']] as any },
    });

    wiring.onRuntimeReady(
      fakeWiring({
        context: {
          attach(entries: unknown) {
            attached.push(entries);
          },
          reset() {
            resets += 1;
          },
        },
      }) as any
    );

    wiring.rebind({ context: () => [['view', 'second']] as any });

    expect(attached).toEqual([[['view', 'first']], [['view', 'second']]]);
    expect(resets).toBe(0);

    wiring.afterUnmount();
    expect(resets).toBe(1);
  });

  it('replaces the complete attached capability set across ownership phases', () => {
    const attached: unknown[] = [];
    let resets = 0;
    const wiring = createHostWiring({
      prototypeName: 'x-replace-view',
      modules: { focus: () => [['owner', true]] as any },
    });

    wiring.onRuntimeReady(
      fakeWiring({
        focus: {
          attach(entries: unknown) {
            attached.push(entries);
          },
          reset() {
            resets += 1;
          },
        },
      }) as any
    );

    wiring.replace({ focus: () => [['view', true]] as any });

    expect(resets).toBe(1);
    expect(attached).toEqual([[['owner', true]], [['view', true]]]);
  });
});
