import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  hoverCardContent,
  hoverCardRoot,
  hoverCardTrigger,
} from '../../../prototypes/base/src/hover-card';

import { createMountedReactAdapter, createMountedReactAdapterInto } from './utils/fake-react';

function appendHost(parent: HTMLElement): HTMLElement {
  const host = document.createElement('span');
  parent.appendChild(host);
  return host;
}

async function advance(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('adapter-react: base hover-card compound protocol', () => {
  it('opens and closes from trigger focus using Root-owned delays', async () => {
    vi.useFakeTimers();
    const root = createMountedReactAdapter(hoverCardRoot, { openDelay: 20, closeDelay: 30 });
    const rootEl = root.root as HTMLElement;
    const trigger = createMountedReactAdapterInto(hoverCardTrigger, appendHost(rootEl));
    const content = createMountedReactAdapterInto(hoverCardContent, appendHost(rootEl));

    try {
      trigger.root?.focus();
      await advance(19);
      expect(root.ref.current?.getExposes().open.get()).toBe(false);

      await advance(1);
      expect(root.ref.current?.getExposes().open.get()).toBe(true);
      expect(content.ref.current?.getExposes().open.get()).toBe(true);

      trigger.root?.blur();
      await advance(29);
      expect(root.ref.current?.getExposes().open.get()).toBe(true);

      await advance(1);
      expect(root.ref.current?.getExposes().open.get()).toBe(false);
      expect(content.ref.current?.getExposes().open.get()).toBe(false);
    } finally {
      content.unmount();
      trigger.unmount();
      root.unmount();
    }
  });
});
