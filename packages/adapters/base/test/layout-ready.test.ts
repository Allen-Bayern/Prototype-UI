import { describe, expect, it, vi } from 'vitest';
import { scheduleAfterWebLayout } from '../src/platform/layout-ready';

describe('adapter-base: Web layout readiness', () => {
  it('waits for two target-realm animation frames before publishing readiness', () => {
    const frames: FrameRequestCallback[] = [];
    const task = vi.fn();
    const fallback = vi.fn();
    const target = {
      ownerDocument: {
        defaultView: {
          requestAnimationFrame(callback: FrameRequestCallback) {
            frames.push(callback);
            return frames.length;
          },
        },
      },
    } as unknown as Element;

    scheduleAfterWebLayout(target, task, fallback);
    expect(frames).toHaveLength(1);
    frames.shift()?.(1);
    expect(task).not.toHaveBeenCalled();
    expect(frames).toHaveLength(1);
    frames.shift()?.(2);

    expect(task).toHaveBeenCalledTimes(1);
    expect(fallback).not.toHaveBeenCalled();
  });

  it('uses the adapter scheduler when the target realm has no animation frame', () => {
    const task = vi.fn();
    const fallback = vi.fn((callback: () => void) => callback());

    scheduleAfterWebLayout(null, task, fallback);

    expect(fallback).toHaveBeenCalledTimes(1);
    expect(task).toHaveBeenCalledTimes(1);
  });
});
