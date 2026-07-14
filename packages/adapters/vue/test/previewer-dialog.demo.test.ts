import { describe, expect, it, vi } from 'vitest';
import { VueAny } from './utils/vue';

import { loadPrototypes } from '../../../../apps/www/src/components/PrototypePreviewer/prototype-modules';
import baseDialogDemo from '../../../../apps/www/src/content/docs/zh-cn/demo-base-dialog.demo';

vi.mock('../../../../apps/www/src/components/PrototypePreviewer/runtimes/vue-runtime', () => ({
  loadVue: vi.fn(async () => VueAny),
}));

async function settle() {
  await Promise.resolve();
  await VueAny.nextTick();
  await Promise.resolve();
}

async function waitForDialogPresent(text: string, timeoutMs = 1_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const element = Array.from(document.body.querySelectorAll('[data-transition-state]')).find(
      (candidate) => candidate.textContent?.includes(text)
    );
    const state = element?.getAttribute('data-transition-state');
    if (state === 'entering' || state === 'entered') return element;
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
  }
  return null;
}

async function waitForDialogAbsent(text: string, timeoutMs = 1_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const element = Array.from(document.body.querySelectorAll('[data-transition-state]')).find(
      (candidate) => candidate.textContent?.includes(text)
    );
    if (!element) return true;
    await new Promise<void>((resolve) => setTimeout(resolve, 10));
  }
  return false;
}

function findExactText(root: ParentNode, text: string): HTMLElement | null {
  return (
    Array.from(root.querySelectorAll<HTMLElement>('[data-pui-root][role="button"]')).find(
      (element) => element.textContent?.trim() === text
    ) ?? null
  );
}

describe('PrototypePreviewer demo-renderer / vue dialog', () => {
  it('opens again after a portaled dialog closes and detaches', async () => {
    await loadPrototypes([
      'base-dialog-root',
      'base-dialog-trigger',
      'base-dialog-mask',
      'base-dialog-content',
      'base-dialog-title',
      'base-dialog-description',
      'base-dialog-close',
    ]);

    const host = document.createElement('div');
    document.body.appendChild(host);

    const { renderDemo } =
      await import('../../../../apps/www/src/components/PrototypePreviewer/demo-renderer');
    const session = await renderDemo({
      runtime: 'vue',
      demo: baseDialogDemo as any,
      host,
    });

    try {
      await settle();
      const trigger = findExactText(host, 'Open Dialog');
      expect(trigger).not.toBeNull();

      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(await waitForDialogPresent('Confirm Action')).not.toBeNull();

      const close = findExactText(document.body, 'Cancel');
      expect(close).not.toBeNull();
      close?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(await waitForDialogAbsent('Confirm Action')).toBe(true);
      await settle();

      trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(await waitForDialogPresent('Confirm Action')).not.toBeNull();
    } finally {
      await session.destroy();
      host.remove();
    }
  });
});
