import { describe, expect, it, vi } from 'vitest';
import { loadPrototypes } from '../../../../apps/www/src/components/PrototypePreviewer/prototype-modules';
import { renderDemo } from '../../../../apps/www/src/components/PrototypePreviewer/demo-renderer';
import demo from '../../../../apps/www/src/content/docs/demo_components/tabs/demo-shadcn-tabs.demo';
import baseDialogDemo from '../../../../apps/www/src/content/docs/zh-cn/demo-base-dialog.demo';
import shadcnDialogDemo from '../../../../apps/www/src/content/docs/zh-cn/demo-shadcn-dialog.demo';
import baseHoverCardDemo from '../../../../apps/www/src/content/docs/zh-cn/demo-base-hover-card.demo';

function styleContains(el: Element | null, token: string): boolean {
  return (el?.getAttribute('data-pui-style') ?? '').split(/\s+/).includes(token);
}

async function settle() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function completeTransitions(...elements: Array<HTMLElement | null>): Promise<void> {
  for (const element of elements) {
    const exposes = (element as any)?.getExposes?.();
    const state = exposes?.transitionState?.get?.();
    if (state === 'entering' || state === 'leaving') exposes.controls.complete();
  }
  await settle();
}

describe('PrototypePreviewer demo-renderer / wc', () => {
  it('passes Hover Card delay props through the demo renderer', async () => {
    vi.useFakeTimers();
    await loadPrototypes([
      'base-hover-card-root',
      'base-hover-card-trigger',
      'base-hover-card-content',
    ]);

    const host = document.createElement('div');
    document.body.appendChild(host);
    const session = await renderDemo({ runtime: 'wc', demo: baseHoverCardDemo as any, host });
    await settle();

    try {
      const root = host.querySelector('wc-base-hover-card-root') as any;
      const trigger = host.querySelector('wc-base-hover-card-trigger') as HTMLElement | null;
      expect(root?.getExposes().open.get()).toBe(false);

      trigger?.focus();
      await vi.advanceTimersByTimeAsync(149);
      expect(root?.getExposes().open.get()).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(root?.getExposes().open.get()).toBe(true);
    } finally {
      await session.destroy();
      host.remove();
      vi.useRealTimers();
    }
  });

  it('renders shadcn tabs parts with host styles in demo wc mode', async () => {
    await loadPrototypes([
      'shadcn-button',
      'shadcn-tabs-root',
      'shadcn-tabs-list',
      'shadcn-tabs-trigger',
      'shadcn-tabs-content',
    ]);

    const host = document.createElement('div');
    document.body.appendChild(host);

    const session = await renderDemo({
      runtime: 'wc',
      demo: demo as any,
      host,
    });

    await Promise.resolve();
    await Promise.resolve();

    const root = host.querySelector('wc-shadcn-tabs-root') as HTMLElement | null;
    const list = host.querySelector('wc-shadcn-tabs-list') as HTMLElement | null;
    const trigger = host.querySelector('wc-shadcn-tabs-trigger') as HTMLElement | null;
    const content = host.querySelector('wc-shadcn-tabs-content') as HTMLElement | null;

    expect(root).not.toBeNull();
    expect(list).not.toBeNull();
    expect(trigger).not.toBeNull();
    expect(content).not.toBeNull();
    expect(styleContains(root, 'flex')).toBe(true);
    expect(root?.className).toContain('w-[420px]');
    expect(styleContains(list, 'inline-flex')).toBe(true);
    expect(styleContains(trigger, 'rounded-lg')).toBe(true);
    expect(styleContains(content, 'min-h-28')).toBe(true);

    await session.destroy();
    host.remove();
  });

  it('moves focus into the base dialog demo when opened', async () => {
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

    const session = await renderDemo({
      runtime: 'wc',
      demo: baseDialogDemo as any,
      host,
    });

    await settle();

    const trigger = host.querySelector('wc-base-dialog-trigger') as HTMLElement | null;
    const content = host.querySelector('wc-base-dialog-content') as HTMLElement | null;
    const mask = host.querySelector('wc-base-dialog-mask') as HTMLElement | null;
    const close = host.querySelector('wc-base-dialog-close') as HTMLElement | null;

    expect(trigger).not.toBeNull();
    expect(content).not.toBeNull();
    expect(close).not.toBeNull();
    expect(content?.hasAttribute('data-pui-view-detached')).toBe(true);

    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();

    expect(styleContains(content, 'hidden')).toBe(false);
    expect(document.activeElement).toBe(close);

    close?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    await completeTransitions(mask, content);

    await session.destroy();
    host.remove();
  });

  it('moves focus into the shadcn dialog demo when opened', async () => {
    await loadPrototypes([
      'shadcn-dialog-root',
      'shadcn-dialog-trigger',
      'shadcn-dialog-mask',
      'shadcn-dialog-content',
      'shadcn-dialog-title',
      'shadcn-dialog-description',
      'shadcn-dialog-close',
    ]);

    const host = document.createElement('div');
    document.body.appendChild(host);

    const session = await renderDemo({
      runtime: 'wc',
      demo: shadcnDialogDemo as any,
      host,
    });

    await settle();

    const trigger = host.querySelector('wc-shadcn-dialog-trigger') as HTMLElement | null;
    const content = host.querySelector('wc-shadcn-dialog-content') as HTMLElement | null;
    const mask = host.querySelector('wc-shadcn-dialog-mask') as HTMLElement | null;
    const close = host.querySelector('wc-shadcn-dialog-close') as HTMLElement | null;

    expect(trigger).not.toBeNull();
    expect(content).not.toBeNull();
    expect(close).not.toBeNull();
    expect(content?.hasAttribute('data-pui-view-detached')).toBe(true);

    trigger?.focus();
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await settle();

    expect(styleContains(content, 'hidden')).toBe(false);
    expect(document.activeElement).toBe(close);

    close?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle();
    await completeTransitions(mask, content);

    await session.destroy();
    host.remove();
  });
});
