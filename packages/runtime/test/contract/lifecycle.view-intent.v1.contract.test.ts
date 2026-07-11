import { describe, expect, it, vi } from 'vitest';
import type { Prototype, RunHandle } from '@proto.ui/core';
import { createRuntimeSession, type RuntimeHost } from '../../src';

function createHost(): RuntimeHost<any> {
  return {
    prototypeName: 'lifecycle-view-intent',
    getRawProps: () => ({}),
    commit(_children, signal) {
      signal?.done();
    },
    schedule(task) {
      task();
    },
  };
}

describe('runtime contract: L1 view intent (v1)', () => {
  it('defaults to present when the prototype does not write view intent', () => {
    const proto: Prototype = {
      name: 'view-intent-default-present',
      setup: () => (renderer) => renderer.el('div', 'ok'),
    };

    const session = createRuntimeSession(proto, createHost());

    expect(session.viewIntent.getSnapshot()).toEqual({ present: true, version: 0 });
    expect(session.mountPhase).toBe('detached');
  });

  it('lets created settle an initially detached intent before the first render', () => {
    const render = vi.fn((renderer: any) => renderer.el('div', 'ok'));
    const proto: Prototype = {
      name: 'view-intent-initial-detached',
      setup(def) {
        def.lifecycle.onCreated((run) => run.lifecycle.setPresent(false));
        return render;
      },
    };

    const session = createRuntimeSession(proto, createHost());

    expect(session.instancePhase).toBe('alive');
    expect(session.mountPhase).toBe('detached');
    expect(session.viewIntent.getSnapshot()).toEqual({ present: false, version: 1 });
    expect(render).not.toHaveBeenCalled();
  });

  it('is callback-only and rejects captured run usage during unknown and render phases', () => {
    let capturedRun!: RunHandle<any>;
    const proto: Prototype = {
      name: 'view-intent-callback-only',
      setup(def) {
        def.lifecycle.onCreated((run) => {
          capturedRun = run;
          expect(() => run.lifecycle.setPresent(false)).not.toThrow();
        });
        return (renderer) => {
          capturedRun.lifecycle.setPresent(true);
          return renderer.el('div', 'ok');
        };
      },
    };

    const session = createRuntimeSession(proto, createHost());

    expect(() => capturedRun.lifecycle.setPresent(true)).toThrow(/phase/i);
    expect(() => session.mount()).toThrow(/phase/i);
    expect(session.mountPhase).toBe('detached');
  });

  it('versions changed intent, suppresses identical writes, and does not mutate actual mount phase', async () => {
    let capturedRun!: RunHandle<any>;
    const proto: Prototype = {
      name: 'view-intent-versioning',
      setup(def) {
        def.lifecycle.onCreated((run) => {
          capturedRun = run;
        });
        return (renderer) => renderer.el('div', 'ok');
      },
    };
    const session = createRuntimeSession(proto, createHost());
    await session.mount();
    const listener = vi.fn();
    session.viewIntent.subscribe(listener);

    session.invokeInCallbackScope(() => capturedRun.lifecycle.setPresent(false));
    session.invokeInCallbackScope(() => capturedRun.lifecycle.setPresent(false));
    session.invokeInCallbackScope(() => capturedRun.lifecycle.setPresent(true));

    expect(listener.mock.calls.map(([snapshot]) => snapshot)).toEqual([
      { present: false, version: 1 },
      { present: true, version: 2 },
    ]);
    expect(session.viewIntent.getSnapshot()).toEqual({ present: true, version: 2 });
    expect(session.mountPhase).toBe('mounted');
  });

  it('rejects intent mutation after terminal disposal begins', async () => {
    let terminalError: unknown;
    const proto: Prototype = {
      name: 'view-intent-terminal-owner',
      setup(def) {
        def.lifecycle.onBeforeDispose((run) => {
          try {
            run.lifecycle.setPresent(false);
          } catch (error) {
            terminalError = error;
          }
        });
        return (renderer) => renderer.el('div', 'ok');
      },
    };
    const session = createRuntimeSession(proto, createHost());

    await session.dispose();

    expect(terminalError).toBeInstanceOf(Error);
    expect(String(terminalError)).toMatch(/terminal disposal/i);
    expect(session.instancePhase).toBe('disposed');
  });
});
