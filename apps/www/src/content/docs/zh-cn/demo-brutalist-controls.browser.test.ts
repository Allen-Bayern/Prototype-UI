// @vitest-environment node

import { spawn, type ChildProcess } from 'node:child_process';
import { access } from 'node:fs/promises';
import { createServer } from 'node:net';
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from 'playwright-core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const RUNTIMES = ['wc', 'react', 'vue'] as const;
type RuntimeId = (typeof RUNTIMES)[number];

const SWITCH_ROUTE = '/en/ui-libraries/brutalist/components/switch/';
const TABS_ROUTE = '/en/ui-libraries/brutalist/components/tabs/';
const SCROLL_AREA_ROUTE = '/en/ui-libraries/brutalist/components/scroll-area/';
const GEOMETRY_EPSILON = 0.5;

let browser: Browser;
let devServer: ChildProcess | null = null;
let baseUrl = '';
let serverOutput = '';

async function availablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Unable to reserve a browser-test port.'));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

async function chromeExecutable(): Promise<string> {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next standard Chrome/Chromium location.
    }
  }

  throw new Error('Chrome/Chromium is required; set CHROME_PATH to its executable.');
}

async function waitForServer(url: string): Promise<void> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (devServer && devServer.exitCode !== null) {
      throw new Error(`Documentation dev server exited early.\n${serverOutput}`);
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
    } catch {
      // The dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${url}.\n${serverOutput}`);
}

function recordServerOutput(chunk: Buffer): void {
  serverOutput = `${serverOutput}${chunk.toString()}`.slice(-20_000);
}

async function startServer(): Promise<string> {
  const externalBaseUrl = process.env.PROTO_UI_BROWSER_BASE_URL?.replace(/\/$/, '');
  if (externalBaseUrl) {
    await waitForServer(`${externalBaseUrl}${SWITCH_ROUTE}`);
    return externalBaseUrl;
  }

  const port = await availablePort();
  const executable = process.platform === 'win32' ? 'corepack.cmd' : 'corepack';
  devServer = spawn(
    executable,
    [
      'pnpm@10.32.1',
      '--filter',
      'apps-www',
      'dev',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort',
    ],
    {
      cwd: process.cwd(),
      detached: process.platform !== 'win32',
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  devServer.stdout?.on('data', recordServerOutput);
  devServer.stderr?.on('data', recordServerOutput);

  const url = `http://127.0.0.1:${port}`;
  await waitForServer(`${url}${SWITCH_ROUTE}`);
  return url;
}

async function stopServer(): Promise<void> {
  if (!devServer || devServer.exitCode !== null || !devServer.pid) return;
  const signalTarget = process.platform === 'win32' ? devServer.pid : -devServer.pid;
  process.kill(signalTarget, 'SIGTERM');

  const exited = await Promise.race([
    new Promise<boolean>((resolve) => devServer?.once('exit', () => resolve(true))),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);
  if (!exited && devServer.exitCode === null) process.kill(signalTarget, 'SIGKILL');
}

async function openRoute(
  route: string,
  viewport: Readonly<{ width: number; height: number }>
): Promise<{ context: BrowserContext; page: Page; previewer: Locator }> {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
  const previewer = page.locator('[data-previewer-id]').first();
  await previewer.waitFor({ state: 'visible' });
  return { context, page, previewer };
}

async function selectRuntime(
  page: Page,
  previewer: Locator,
  runtime: RuntimeId,
  readySelector: string,
  expectedCount: number
): Promise<void> {
  await previewer.locator('select.adapter-select').selectOption(runtime);
  await page.waitForFunction(
    ({ expectedCount: count, readySelector: selector, runtime: selectedRuntime }) => {
      const root = document.querySelector<HTMLElement>('[data-previewer-id]');
      const select = root?.querySelector<HTMLSelectElement>('select.adapter-select');
      const host = root?.querySelector<HTMLElement>('.host');
      const firstRoot = host?.querySelector<HTMLElement>('[data-pui-root]');
      if (!root || !select || !host || select.value !== selectedRuntime) return false;
      if (root.querySelectorAll(selector).length !== count || !firstRoot) return false;
      if (selectedRuntime === 'wc') return firstRoot.tagName.startsWith('WC-');
      if (selectedRuntime === 'vue') return host.hasAttribute('data-v-app');
      return firstRoot.tagName === 'DIV' && !host.hasAttribute('data-v-app');
    },
    { expectedCount, readySelector, runtime },
    { timeout: 20_000 }
  );
}

beforeAll(async () => {
  baseUrl = await startServer();
  browser = await chromium.launch({
    executablePath: await chromeExecutable(),
    headless: true,
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
}, 150_000);

afterAll(async () => {
  await browser?.close();
  await stopServer();
});

describe.sequential('Brutalist control documentation browser regressions', () => {
  it('gives every Switch a non-empty accessible name in all runtimes', async () => {
    const { context, page, previewer } = await openRoute(SWITCH_ROUTE, {
      width: 1440,
      height: 900,
    });

    try {
      for (const runtime of RUNTIMES) {
        await selectRuntime(page, previewer, runtime, '[role="switch"]', 3);
        const switches = previewer.getByRole('switch');
        const names: string[] = [];
        for (let index = 0; index < 3; index += 1) {
          const snapshot = await switches.nth(index).ariaSnapshot();
          names.push(snapshot.match(/switch "([^"]+)"/)?.[1] ?? '');
        }
        expect(names, runtime).toEqual(['Email alerts', 'Release alerts', 'Archived alerts']);
        expect(await switches.nth(0).getAttribute('aria-checked'), runtime).toBe('false');
        expect(await switches.nth(1).getAttribute('aria-checked'), runtime).toBe('true');
        expect(await switches.nth(2).getAttribute('aria-disabled'), runtime).toBe('true');
      }
    } finally {
      await context.close();
    }
  }, 90_000);

  it('keeps the Tabs Root bounds stable across selection in all runtimes', async () => {
    const { context, page, previewer } = await openRoute(TABS_ROUTE, {
      width: 1440,
      height: 900,
    });

    try {
      for (const runtime of RUNTIMES) {
        await selectRuntime(page, previewer, runtime, '[role="tab"]', 2);
        const root = previewer.locator('.host > [data-pui-root]').first();
        const before = await root.boundingBox();
        expect(before, runtime).not.toBeNull();

        const details = previewer.getByRole('tab', { name: 'Details' });
        await details.click();
        await page.waitForFunction(
          () =>
            document
              .querySelector('[data-previewer-id] [role="tab"]:nth-of-type(2)')
              ?.getAttribute('aria-selected') === 'true'
        );

        const after = await root.boundingBox();
        expect(after, runtime).not.toBeNull();
        expect(Math.abs(after!.x - before!.x), runtime).toBeLessThanOrEqual(GEOMETRY_EPSILON);
        expect(Math.abs(after!.width - before!.width), runtime).toBeLessThanOrEqual(
          GEOMETRY_EPSILON
        );
      }
    } finally {
      await context.close();
    }
  }, 90_000);

  it('contains Scroll Area and its scrollbar at 320px without document overflow', async () => {
    const viewportWidth = 320;
    const { context, page, previewer } = await openRoute(SCROLL_AREA_ROUTE, {
      width: viewportWidth,
      height: 844,
    });
    const widths: number[] = [];

    try {
      for (const runtime of RUNTIMES) {
        await selectRuntime(page, previewer, runtime, '[data-demo-ref="scrollbar"]', 1);
        const root = previewer.locator('.host > div > [data-pui-root]').first();
        const scrollbar = previewer.locator('[data-demo-ref="scrollbar"]').first();
        const rootBox = await root.boundingBox();
        const scrollbarBox = await scrollbar.boundingBox();
        expect(rootBox, runtime).not.toBeNull();
        expect(scrollbarBox, runtime).not.toBeNull();

        widths.push(rootBox!.width);
        expect(rootBox!.x, runtime).toBeGreaterThanOrEqual(-GEOMETRY_EPSILON);
        expect(rootBox!.x + rootBox!.width, runtime).toBeLessThanOrEqual(
          viewportWidth + GEOMETRY_EPSILON
        );
        expect(scrollbarBox!.x, runtime).toBeGreaterThanOrEqual(rootBox!.x);
        expect(scrollbarBox!.x + scrollbarBox!.width, runtime).toBeLessThanOrEqual(
          viewportWidth + GEOMETRY_EPSILON
        );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
          ),
          runtime
        ).toBe(0);
      }

      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(GEOMETRY_EPSILON);
    } finally {
      await context.close();
    }
  }, 90_000);
});
