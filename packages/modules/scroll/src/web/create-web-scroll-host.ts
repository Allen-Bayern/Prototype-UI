import type {
  ScrollAxis,
  ScrollAxisSnapshot,
  ScrollProjectionPreference,
  ScrollSurfaceHostConnection,
  ScrollSurfaceRequest,
  ScrollSurfaceSnapshot,
} from '@proto.ui/core';
import type { ScrollSurfaceHost, ScrollSurfaceHostLease } from '../caps';

export type WebScrollSurfaceHostOptions = Readonly<{
  preference?: ScrollProjectionPreference;
  scrollEndDelay?: number;
}>;

const clampRatio = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

function axisSnapshot(offset: number, viewport: number, extent: number): ScrollAxisSnapshot {
  const range = Math.max(0, extent - viewport);
  const clampedOffset = Math.min(range, Math.max(0, Number.isFinite(offset) ? offset : 0));
  return Object.freeze({
    position: range > 0 ? clampRatio(clampedOffset / range) : 0,
    visibleRatio: extent > 0 ? clampRatio(viewport / extent) : 1,
    canScrollBefore: clampedOffset > 0,
    canScrollAfter: clampedOffset < range,
  });
}

function applyRequest(target: HTMLElement, request: ScrollSurfaceRequest): void {
  const horizontal = request.axis === 'horizontal';
  const viewport = horizontal ? target.clientWidth : target.clientHeight;
  const extent = horizontal ? target.scrollWidth : target.scrollHeight;
  const range = Math.max(0, extent - viewport);
  const current = horizontal ? target.scrollLeft : target.scrollTop;
  let next = current;
  if (request.kind === 'by') next += request.delta;
  if (request.kind === 'page') next += request.direction === 'after' ? viewport : -viewport;
  if (request.kind === 'to' || request.kind === 'control-drag') {
    next = range * clampRatio(request.position);
  }
  next = Math.min(range, Math.max(0, next));
  if (horizontal) target.scrollLeft = next;
  else target.scrollTop = next;
}

export function createWebScrollSurfaceHost(
  target: HTMLElement,
  options: WebScrollSurfaceHostOptions = {}
): ScrollSurfaceHost {
  return {
    support: Object.freeze({ system: true, composed: true }),
    preference: options.preference ?? 'auto',
    attach(initialConnection): ScrollSurfaceHostLease {
      let connection = initialConnection;
      let disposed = false;
      let scrolling = false;
      let endTimer: ReturnType<typeof setTimeout> | undefined;
      const original = {
        overflowX: target.style.overflowX,
        overflowY: target.style.overflowY,
        scrollbarWidth: target.style.scrollbarWidth,
        projection: target.getAttribute('data-pui-scroll-projection'),
      };

      const projectPolicy = () => {
        const axes = connection.config.axes;
        target.style.overflowX = axes === 'vertical' ? 'hidden' : 'auto';
        target.style.overflowY = axes === 'horizontal' ? 'hidden' : 'auto';
        target.style.scrollbarWidth = connection.projection === 'composed' ? 'none' : '';
        target.setAttribute('data-pui-scroll-projection', connection.projection);
      };
      const snapshot = (): ScrollSurfaceSnapshot =>
        Object.freeze({
          axes: connection.config.axes,
          horizontal: axisSnapshot(target.scrollLeft, target.clientWidth, target.scrollWidth),
          vertical: axisSnapshot(target.scrollTop, target.clientHeight, target.scrollHeight),
          scrolling,
          projection: connection.projection,
        });
      const publish = () => {
        if (!disposed) connection.onFacts(snapshot());
      };
      const onScroll = () => {
        scrolling = true;
        publish();
        if (endTimer) clearTimeout(endTimer);
        endTimer = setTimeout(() => {
          scrolling = false;
          publish();
        }, options.scrollEndDelay ?? 120);
      };
      target.addEventListener('scroll', onScroll, { passive: true });
      const resizeObserver =
        typeof ResizeObserver === 'function' ? new ResizeObserver(() => publish()) : undefined;
      resizeObserver?.observe(target);
      if (target.firstElementChild instanceof Element)
        resizeObserver?.observe(target.firstElementChild);
      const ownerWindow = target.ownerDocument.defaultView;
      ownerWindow?.addEventListener('resize', publish);
      projectPolicy();
      publish();

      return {
        update(nextConnection) {
          if (disposed) return;
          connection = nextConnection;
          projectPolicy();
          publish();
        },
        request(request) {
          if (disposed) return;
          applyRequest(target, request);
          publish();
        },
        dispose() {
          if (disposed) return;
          disposed = true;
          if (endTimer) clearTimeout(endTimer);
          target.removeEventListener('scroll', onScroll);
          ownerWindow?.removeEventListener('resize', publish);
          resizeObserver?.disconnect();
          target.style.overflowX = original.overflowX;
          target.style.overflowY = original.overflowY;
          target.style.scrollbarWidth = original.scrollbarWidth;
          if (original.projection === null) target.removeAttribute('data-pui-scroll-projection');
          else target.setAttribute('data-pui-scroll-projection', original.projection);
        },
      };
    },
  };
}
