import { describe, expect, it, vi } from 'vitest';
import { createDeferredOwnerDisposal, createViewEpochOwner } from '../src';

describe('adapter-base: view epoch owner', () => {
  it('rebinds view epochs without recreating or disposing the Proto session', async () => {
    const owner = createViewEpochOwner<any>({ prototypeName: 'x-view-owner' });
    const calls: string[] = [];
    const session = {
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
