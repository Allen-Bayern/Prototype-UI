import { afterEach, describe, expect, it } from 'vitest';
import type { AnchoredPositionConfig } from '@proto.ui/core';
import { createFloatingUiAnchoredPositionHost } from '../src';

const rect = (x: number, y: number, width: number, height: number): DOMRect =>
  ({
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    right: x + width,
    bottom: y + height,
    toJSON: () => ({}),
  }) as DOMRect;

function setRect(element: HTMLElement, value: DOMRect): void {
  element.getBoundingClientRect = () => value;
  Object.defineProperties(element, {
    offsetWidth: { configurable: true, value: value.width },
    offsetHeight: { configurable: true, value: value.height },
  });
}

const baseConfig: AnchoredPositionConfig = {
  side: 'bottom',
  align: 'start',
  sideOffset: 4,
  alignOffset: 0,
  strategy: 'fixed',
  avoidCollisions: false,
  collisionBoundary: 'clippingAncestors',
  collisionPadding: 0,
};

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
}

afterEach(() => document.body.replaceChildren());

describe('module-positioning: Floating UI host', () => {
  it('applies side, alignment, offsets, categorical data, and non-transform coordinates', async () => {
    const anchor = document.createElement('button');
    const floating = document.createElement('div');
    document.body.append(anchor, floating);
    setRect(anchor, rect(100, 100, 50, 20));
    setRect(floating, rect(0, 0, 40, 10));

    const snapshots: unknown[] = [];
    const lease = createFloatingUiAnchoredPositionHost().attach({
      anchor,
      floating,
      config: baseConfig,
      onResolved: (snapshot) => snapshots.push(snapshot),
    });
    await flush();

    expect(floating.style.position).toBe('fixed');
    expect(floating.style.left).toBe('100px');
    expect(floating.style.top).toBe('124px');
    expect(floating.style.transform).toBe('');
    expect(floating.dataset).toMatchObject({ side: 'bottom', align: 'start' });
    expect(floating.style.getPropertyValue('--proto-ui-anchor-width')).toBe('50px');
    expect(floating.style.getPropertyValue('--proto-ui-anchor-height')).toBe('20px');
    expect(floating.style.getPropertyValue('--proto-ui-available-width')).toMatch(/px$/);
    expect(floating.style.getPropertyValue('--proto-ui-available-height')).toMatch(/px$/);
    expect(snapshots.at(-1)).toEqual({ side: 'bottom', align: 'start', strategy: 'fixed' });

    lease.update({
      anchor,
      floating,
      config: { ...baseConfig, side: 'top', align: 'end', sideOffset: 8 },
    });
    await flush();
    expect(floating.style.left).toBe('110px');
    expect(floating.style.top).toBe('82px');
    expect(floating.dataset).toMatchObject({ side: 'top', align: 'end' });
    lease.dispose();
  });

  it('reports collision-resolved side and alignment against the viewport', async () => {
    const anchor = document.createElement('button');
    const floating = document.createElement('div');
    document.body.append(anchor, floating);
    setRect(anchor, rect(100, 760, 50, 8));
    setRect(floating, rect(0, 0, 80, 40));

    const lease = createFloatingUiAnchoredPositionHost().attach({
      anchor,
      floating,
      config: { ...baseConfig, avoidCollisions: true, collisionPadding: 4 },
    });
    await flush();

    expect(floating.dataset.side).toBe('top');
    expect(floating.dataset.align).toBe('end');
    lease.dispose();
  });
});
