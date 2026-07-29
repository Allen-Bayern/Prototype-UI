import { afterEach, describe, expect, it } from 'vitest';
import type { ScrollSurfaceSnapshot } from '@proto.ui/core';
import { createWebScrollSurfaceHost } from '../src';

function setMetrics(
  target: HTMLElement,
  metrics: {
    clientWidth: number;
    scrollWidth: number;
    clientHeight: number;
    scrollHeight: number;
  }
): void {
  Object.defineProperties(target, {
    clientWidth: { configurable: true, value: metrics.clientWidth },
    scrollWidth: { configurable: true, value: metrics.scrollWidth },
    clientHeight: { configurable: true, value: metrics.clientHeight },
    scrollHeight: { configurable: true, value: metrics.scrollHeight },
    scrollLeft: { configurable: true, value: 0, writable: true },
    scrollTop: { configurable: true, value: 0, writable: true },
  });
}

afterEach(() => document.body.replaceChildren());

describe('module-scroll: Web scroll surface host', () => {
  it('reports normalized facts and applies requests without exposing the target', () => {
    const target = document.createElement('div');
    setMetrics(target, {
      clientWidth: 200,
      scrollWidth: 600,
      clientHeight: 160,
      scrollHeight: 960,
    });
    document.body.append(target);
    const snapshots: ScrollSurfaceSnapshot[] = [];

    const lease = createWebScrollSurfaceHost(target).attach({
      config: { axes: 'both', projection: 'system' },
      projection: 'system',
      onFacts: (snapshot) => snapshots.push(snapshot),
    });

    expect(snapshots.at(-1)).toMatchObject({
      axes: 'both',
      horizontal: { position: 0, visibleRatio: 1 / 3, canScrollAfter: true },
      vertical: { position: 0, visibleRatio: 1 / 6, canScrollAfter: true },
      projection: 'system',
    });
    expect(target.getAttribute('role')).toBeNull();
    expect(target.getAttributeNames().some((name) => name.startsWith('aria-'))).toBe(false);

    lease.request({ kind: 'to', axis: 'horizontal', position: 0.5 });
    lease.request({ kind: 'control-drag', axis: 'vertical', position: 0.25 });

    expect(target.scrollLeft).toBe(200);
    expect(target.scrollTop).toBe(200);
    expect(snapshots.at(-1)).toMatchObject({
      horizontal: { position: 0.5, canScrollBefore: true, canScrollAfter: true },
      vertical: { position: 0.25, canScrollBefore: true, canScrollAfter: true },
    });
    lease.dispose();
  });

  it('projects composed chrome policy and restores host styles on disposal', () => {
    const target = document.createElement('div');
    setMetrics(target, {
      clientWidth: 100,
      scrollWidth: 100,
      clientHeight: 100,
      scrollHeight: 400,
    });
    target.style.overflowY = 'scroll';
    target.style.scrollbarWidth = 'thin';
    document.body.append(target);

    let reports = 0;
    const lease = createWebScrollSurfaceHost(target, { preference: 'composed' }).attach({
      config: { axes: 'vertical', projection: 'auto' },
      projection: 'composed',
      onFacts: () => reports++,
    });

    expect(target.dataset.puiScrollProjection).toBe('composed');
    expect(target.style.overflowX).toBe('hidden');
    expect(target.style.overflowY).toBe('auto');
    expect(target.style.scrollbarWidth).toBe('none');
    const beforeDispose = reports;

    lease.dispose();
    target.dispatchEvent(new Event('scroll'));
    expect(reports).toBe(beforeDispose);
    expect(target.hasAttribute('data-pui-scroll-projection')).toBe(false);
    expect(target.style.overflowY).toBe('scroll');
    expect(target.style.scrollbarWidth).toBe('thin');
  });
});
