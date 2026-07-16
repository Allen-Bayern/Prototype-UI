import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  hoverCardContent,
  hoverCardRoot,
  hoverCardTrigger,
} from '../../../prototypes/base/src/hover-card';

import { createVueAdapter } from '../src/adapt';
import { flushVue, VueAny } from './utils/vue';

async function advance(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  await flushVue();
  await flushVue();
}

afterEach(() => {
  vi.useRealTimers();
});

describe('adapter-vue: base hover-card compound protocol', () => {
  it('opens and closes from trigger focus using Root-owned delays', async () => {
    vi.useFakeTimers();
    const adapter = createVueAdapter(VueAny);
    const Root = adapter(hoverCardRoot);
    const Trigger = adapter(hoverCardTrigger);
    const Content = adapter(hoverCardContent);
    const refs: Record<string, any> = {};
    const host = document.createElement('div');
    document.body.appendChild(host);

    const app = VueAny.createApp({
      setup() {
        return () =>
          VueAny.h(
            Root,
            { openDelay: 20, closeDelay: 30, ref: (el: any) => (refs.root = el) },
            () => [
              VueAny.h(Trigger, { ref: (el: any) => (refs.trigger = el) }, () => 'Hover me'),
              VueAny.h(Content, { ref: (el: any) => (refs.content = el) }, () => 'Preview'),
            ]
          );
      },
    });

    app.mount(host);
    await flushVue();
    await flushVue();

    try {
      refs.trigger?.$el.focus();
      await advance(19);
      expect(refs.root?.getExposes().open.get()).toBe(false);

      await advance(1);
      expect(refs.root?.getExposes().open.get()).toBe(true);
      expect(refs.content?.getExposes().open.get()).toBe(true);

      refs.trigger?.$el.blur();
      await advance(29);
      expect(refs.root?.getExposes().open.get()).toBe(true);

      await advance(1);
      expect(refs.root?.getExposes().open.get()).toBe(false);
      expect(refs.content?.getExposes().open.get()).toBe(false);
    } finally {
      app.unmount();
      host.remove();
    }
  });
});
