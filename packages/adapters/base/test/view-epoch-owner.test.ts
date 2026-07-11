import { describe, expect, it, vi } from 'vitest';
import { createDeferredOwnerDisposal, createViewEpochOwner } from '../src';

describe('adapter-base: view epoch owner', () => {
  it('rebinds view epochs without recreating or disposing the Proto session', async () => {
    const owner = createViewEpochOwner<any>({ prototypeName: 'x-view-owner' });
    const calls: string[] = [];
    const session = {
      viewIntent: {
        getSnapshot: () => ({ present: true, version: 0 }),
        subscribe: () => () => {},
      },
      mount: vi.fn(async () => calls.push('mount')),
      unmount: vi.fn(async () => calls.push('unmount')),
      dispose: vi.fn(async () => calls.push('dispose')),
    } as any;
    const createSession = vi.fn(() => session);

    owner.attachView({
      modules: { event: () => [] },
      disposeView: () => calls.push('view:1.dispose'),
      createSession,
    });
    await owner.detachView();

    owner.attachView({
      modules: { event: () => [] },
      disposeView: () => calls.push('view:2.dispose'),
      createSession,
    });

    expect(createSession).toHaveBeenCalledOnce();
    expect(session.mount).toHaveBeenCalledOnce();
    expect(calls).toEqual(['unmount', 'view:1.dispose', 'mount']);

    await owner.dispose();
    expect(calls).toEqual(['unmount', 'view:1.dispose', 'mount', 'dispose', 'view:2.dispose']);
  });

  it('initializes one detached session and forwards versioned view intent before any view exists', async () => {
    const owner = createViewEpochOwner<any>({ prototypeName: 'x-detached-owner' });
    const intentListeners = new Set<(snapshot: { present: boolean; version: number }) => void>();
    let snapshot = { present: false, version: 1 };
    const calls: string[] = [];
    const session = {
      viewIntent: {
        getSnapshot: () => snapshot,
        subscribe(listener: (next: typeof snapshot) => void) {
          intentListeners.add(listener);
          return () => intentListeners.delete(listener);
        },
      },
      mount: vi.fn(async () => calls.push('mount')),
      unmount: vi.fn(async () => calls.push('unmount')),
      dispose: vi.fn(async () => calls.push('dispose')),
    } as any;
    const onViewIntent = vi.fn();

    owner.initialize({
      modules: {},
      createSession: () => session,
      onViewIntent,
    });

    expect(owner.session).toBe(session);
    expect(owner.hasView).toBe(false);
    expect(owner.viewIntent).toEqual({ present: false, version: 1 });
    expect(onViewIntent).toHaveBeenLastCalledWith({ present: false, version: 1 });
    expect(session.mount).not.toHaveBeenCalled();

    snapshot = { present: true, version: 2 };
    for (const listener of intentListeners) listener(snapshot);
    expect(owner.viewIntent).toEqual({ present: true, version: 2 });

    owner.attachView({
      modules: { event: () => [] },
      disposeView: () => calls.push('view.dispose'),
      createSession: () => {
        throw new Error('must reuse detached session');
      },
    });
    expect(session.mount).toHaveBeenCalledOnce();

    await owner.dispose();
    expect(intentListeners.size).toBe(0);
    expect(calls).toEqual(['mount', 'dispose', 'view.dispose']);
  });

  it('defers terminal owner disposal and cancels it when ownership is retained', async () => {
    const dispose = vi.fn();
    const scheduler = createDeferredOwnerDisposal(dispose);

    scheduler.release();
    scheduler.retain();
    await Promise.resolve();
    expect(dispose).not.toHaveBeenCalled();

    scheduler.release();
    await Promise.resolve();
    expect(dispose).toHaveBeenCalledOnce();
  });
});
