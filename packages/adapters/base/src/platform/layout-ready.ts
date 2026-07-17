export type AdapterTaskScheduler = (task: () => void) => void;

/**
 * Schedule work after the Web host has had an opportunity to produce layout.
 * The target supplies the platform realm; callers do not reach through
 * globalThis, and non-visual hosts can provide their normal adapter scheduler.
 */
export function scheduleAfterWebLayout(
  target: Element | null,
  task: () => void,
  fallback: AdapterTaskScheduler
): void {
  const view = target?.ownerDocument?.defaultView;
  if (typeof view?.requestAnimationFrame === 'function') {
    view.requestAnimationFrame(() => {
      view.requestAnimationFrame(() => task());
    });
    return;
  }
  fallback(task);
}
