import type {
  ScrollAxis,
  ScrollAxisSnapshot,
  ScrollProjectionPreference,
  ScrollSurfaceRequest,
  ScrollSurfaceSnapshot,
} from '@proto.ui/core';
import type {
  ScrollComposedChromeHostControl,
  ScrollSurfaceHost,
  ScrollSurfaceHostAttachment,
  ScrollSurfaceHostLease,
} from '../caps';

export type WebScrollSurfaceHostOptions = Readonly<{
  preference?: ScrollProjectionPreference;
  scrollEndDelay?: number;
  minThumbSize?: number;
}>;

type ThumbStyleSnapshot = Readonly<{
  width: string;
  height: string;
  transform: string;
  display: string;
  sizeVar: string;
  offsetVar: string;
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

function px(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isWebControl(
  control: ScrollComposedChromeHostControl
): control is ScrollComposedChromeHostControl & {
  trackTarget: HTMLElement;
  thumbTarget: HTMLElement;
} {
  return control.trackTarget instanceof HTMLElement && control.thumbTarget instanceof HTMLElement;
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
      const thumbStyles = new Map<HTMLElement, ThumbStyleSnapshot>();
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
      const rememberThumb = (thumb: HTMLElement) => {
        if (thumbStyles.has(thumb)) return;
        thumbStyles.set(
          thumb,
          Object.freeze({
            width: thumb.style.width,
            height: thumb.style.height,
            transform: thumb.style.transform,
            display: thumb.style.display,
            sizeVar: thumb.style.getPropertyValue('--proto-ui-scroll-thumb-size'),
            offsetVar: thumb.style.getPropertyValue('--proto-ui-scroll-thumb-offset'),
          })
        );
      };
      const restoreThumb = (thumb: HTMLElement) => {
        const original = thumbStyles.get(thumb);
        if (!original) return;
        thumb.style.width = original.width;
        thumb.style.height = original.height;
        thumb.style.transform = original.transform;
        thumb.style.display = original.display;
        if (original.sizeVar) {
          thumb.style.setProperty('--proto-ui-scroll-thumb-size', original.sizeVar);
        } else {
          thumb.style.removeProperty('--proto-ui-scroll-thumb-size');
        }
        if (original.offsetVar) {
          thumb.style.setProperty('--proto-ui-scroll-thumb-offset', original.offsetVar);
        } else {
          thumb.style.removeProperty('--proto-ui-scroll-thumb-offset');
        }
        thumbStyles.delete(thumb);
      };
      const restoreInactiveThumbs = (active: ReadonlySet<HTMLElement>) => {
        for (const thumb of Array.from(thumbStyles.keys())) {
          if (!active.has(thumb)) restoreThumb(thumb);
        }
      };
      const projectComposedChrome = (facts: ScrollSurfaceSnapshot) => {
        const active = new Set<HTMLElement>();
        if (connection.projection !== 'composed') {
          restoreInactiveThumbs(active);
          return;
        }
        for (const control of connection.composedChrome?.controls ?? []) {
          if (!isWebControl(control)) continue;
          const axis = control.getAxis();
          const track = control.trackTarget;
          const thumb = control.thumbTarget;
          active.add(thumb);
          rememberThumb(thumb);

          const axisFacts = facts[axis];
          const style = track.ownerDocument.defaultView?.getComputedStyle(track);
          const trackExtent = axis === 'vertical' ? track.clientHeight : track.clientWidth;
          const startInset = style
            ? px(axis === 'vertical' ? style.paddingTop : style.paddingLeft)
            : 0;
          const endInset = style
            ? px(axis === 'vertical' ? style.paddingBottom : style.paddingRight)
            : 0;
          const available = Math.max(0, trackExtent - startInset - endInset);

          if (available <= 0 || axisFacts.visibleRatio >= 1) {
            thumb.style.display = 'none';
            continue;
          }

          const minThumbSize = Math.max(0, options.minThumbSize ?? 18);
          const thumbExtent = Math.min(
            available,
            Math.max(minThumbSize, available * clampRatio(axisFacts.visibleRatio))
          );
          const offset = Math.max(0, available - thumbExtent) * clampRatio(axisFacts.position);
          const originalThumbStyle = thumbStyles.get(thumb);
          thumb.style.display = originalThumbStyle?.display ?? '';
          thumb.style.setProperty('--proto-ui-scroll-thumb-size', `${thumbExtent}px`);
          thumb.style.setProperty('--proto-ui-scroll-thumb-offset', `${offset}px`);
          if (axis === 'vertical') {
            thumb.style.width = originalThumbStyle?.width ?? '';
            thumb.style.height = 'var(--proto-ui-scroll-thumb-size)';
            thumb.style.transform = 'translate3d(0, var(--proto-ui-scroll-thumb-offset), 0)';
          } else {
            thumb.style.height = originalThumbStyle?.height ?? '';
            thumb.style.width = 'var(--proto-ui-scroll-thumb-size)';
            thumb.style.transform = 'translate3d(var(--proto-ui-scroll-thumb-offset), 0, 0)';
          }
        }
        restoreInactiveThumbs(active);
      };
      const publish = () => {
        if (disposed) return;
        const facts = snapshot();
        projectComposedChrome(facts);
        connection.onFacts(facts);
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
      const mutationObserver =
        typeof MutationObserver === 'function' ? new MutationObserver(() => publish()) : undefined;
      const observeGeometry = () => {
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        resizeObserver?.observe(target);
        if (target.firstElementChild instanceof Element) {
          resizeObserver?.observe(target.firstElementChild);
        }
        for (const control of connection.composedChrome?.controls ?? []) {
          if (!isWebControl(control)) continue;
          resizeObserver?.observe(control.trackTarget);
          mutationObserver?.observe(control.trackTarget, {
            attributes: true,
            attributeFilter: ['class', 'style'],
          });
        }
      };
      const ownerWindow = target.ownerDocument.defaultView;
      ownerWindow?.addEventListener('resize', publish);
      projectPolicy();
      observeGeometry();
      publish();

      return {
        update(nextConnection: ScrollSurfaceHostAttachment) {
          if (disposed) return;
          connection = nextConnection;
          projectPolicy();
          observeGeometry();
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
          mutationObserver?.disconnect();
          restoreInactiveThumbs(new Set());
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
