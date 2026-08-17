// @vitest-environment node

import type { Browser, Page } from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  RUNTIMES,
  applyColorScheme,
  launchBrowser,
  openRoute,
  selectRuntime,
  startServer,
  stopServer,
} from './browser-harness';

const TEXTAREA_ROUTE = '/en/ui-libraries/shadcn/textarea/';

let browser: Browser;
let baseUrl = '';

/** Painted background of the first editor, resolved through a canvas. */
async function editorBackground(page: Page): Promise<{ rgba: number[]; alpha: number }> {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Canvas 2D context is required to resolve painted colours.');
    const editor = document.querySelector('[data-previewer-id] textarea');
    if (!editor) throw new Error('The shadcn Textarea demo must render a host-owned editor.');
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = 'rgba(0,0,0,0)';
    context.fillStyle = getComputedStyle(editor).backgroundColor;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
    return { rgba: [r, g, b, a], alpha: a / 255 };
  });
}

beforeAll(async () => {
  baseUrl = await startServer(TEXTAREA_ROUTE);
  browser = await launchBrowser();
}, 150_000);

afterAll(async () => {
  await browser?.close();
  await stopServer();
});

describe.sequential('shadcn control documentation browser regressions', () => {
  it('rings the Textarea on pointer focus wherever focus reaches the projection', async () => {
    const { context, page, previewer } = await openRoute(browser, baseUrl, TEXTAREA_ROUTE, {
      width: 1440,
      height: 900,
    });

    try {
      await previewer.scrollIntoViewIfNeeded();
      for (const runtime of RUNTIMES) {
        await selectRuntime(page, previewer, runtime, '[data-pui-root]', 3);
        await applyColorScheme(page, 'light');
        await previewer.locator('textarea').first().click();
        await page.waitForTimeout(200);

        const state = await page.evaluate(() => {
          const editor = document.querySelector('[data-previewer-id] textarea');
          if (!editor) throw new Error('The shadcn Textarea demo must render a host-owned editor.');
          const style = getComputedStyle(editor);
          return {
            focusProjected: editor.hasAttribute('data-focused'),
            nativeFocusVisible: editor.matches(':focus-visible'),
            ringPainted:
              !/^rgba\(0, 0, 0, 0\) 0px 0px 0px 0px(, rgba\(0, 0, 0, 0\) 0px 0px 0px 0px)*$/.test(
                style.boxShadow
              ),
          };
        });

        // A text control always matches :focus-visible once focused, which is
        // what upstream keys the ring on.
        expect(state.nativeFocusVisible, `${runtime}/native`).toBe(true);

        if (state.focusProjected) {
          expect(state.ringPainted, `${runtime}/ring`).toBe(true);
        }
        // Web Components does not project text-control focus onto the host yet,
        // so the ring cannot paint there. That gap is #395, fixed by #426; this
        // case starts covering wc automatically once that lands.
      }
    } finally {
      await context.close();
    }
  }, 180_000);

  it('repaints the Textarea colorScheme surface across light-dark-light in all runtimes', async () => {
    const { context, page, previewer } = await openRoute(browser, baseUrl, TEXTAREA_ROUTE, {
      width: 1440,
      height: 900,
    });

    try {
      await previewer.scrollIntoViewIfNeeded();
      for (const runtime of RUNTIMES) {
        await selectRuntime(page, previewer, runtime, '[data-pui-root]', 3);

        // The dark fill is `bg-input/30`, so it is the only one of the three
        // that paints a non-transparent background. Switching away must clear
        // it again: a rule that samples the scheme once would stay stale.
        await applyColorScheme(page, 'light');
        const lightBefore = await editorBackground(page);
        expect(lightBefore.alpha, `${runtime}/light-before`).toBe(0);

        await applyColorScheme(page, 'dark');
        const dark = await editorBackground(page);
        expect(dark.alpha, `${runtime}/dark`).toBeGreaterThan(0);

        await applyColorScheme(page, 'light');
        const lightAfter = await editorBackground(page);
        expect(lightAfter.alpha, `${runtime}/light-after`).toBe(0);
      }
    } finally {
      await context.close();
    }
  }, 180_000);
});
