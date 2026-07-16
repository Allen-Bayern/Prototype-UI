import { describe, expect, it } from 'vitest';
import {
  definePrototype,
  HOST_ELEMENT_CAP,
  type ObservedStateHandle,
  type OverlayHandle,
} from '@proto.ui/core';
import { asOverlay } from '@proto.ui/hooks';
import type { RuntimeHost } from '../../src';
import { executeWithHost } from '../../src';
import { BOUNDARY_HOST_BRIDGE_CAP } from '@proto.ui/module-boundary';
import { EVENT_GLOBAL_TARGET_CAP } from '@proto.ui/module-event';
import { OVERLAY_GLOBAL_MOUNT_CAP, type OverlayPort } from '@proto.ui/module-overlay';
import {
  ANCHORED_POSITION_HOST_CAP,
  type AnchoredPositionHostLease,
} from '@proto.ui/module-positioning';
import type { PropsBaseType } from '@proto.ui/types';

const createHost = <P extends PropsBaseType>(
  name: string,
  options?: {
    onRuntimeReady?: (wiring: {
      attach(moduleName: string, entries: readonly unknown[]): void;
    }) => void;
  }
) => {
  const host: RuntimeHost<P> = {
    prototypeName: name,
    getRawProps: () => ({}) as any,
    commit(_children, signal) {
      signal?.done();
    },
    schedule(task) {
      task();
    },
    onRuntimeReady: options?.onRuntimeReady as any,
  };

  return { host };
};

describe('runtime contract: overlay (v0)', () => {
  it('OVERLAY-0050: anchored positioning is host-mediated and active only with a live view', () => {
    let overlay!: OverlayHandle<PropsBaseType>;
    let connection: any = null;
    let disposed = 0;
    const anchor = document.createElement('button');
    const content = document.createElement('div');

    const lease: AnchoredPositionHostLease = {
      update(next) {
        connection = next;
      },
      requestUpdate() {},
      dispose() {
        disposed += 1;
      },
    };

    const P = definePrototype({
      name: 'x-overlay-0050',
      setup(def) {
        overlay = asOverlay<PropsBaseType>();
        overlay.configure({
          anchored: true,
          defaultOpen: true,
          placement: 'right',
          align: 'end',
          sideOffset: 8,
          avoidCollisions: true,
          collisionBoundary: 'clippingAncestors',
          collisionPadding: 6,
        });
        def.lifecycle.onMounted(() => {
          overlay.registerAnchor(anchor);
          overlay.registerContent(content);
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name, {
      onRuntimeReady(wiring) {
        wiring.attach('positioning', [
          [
            ANCHORED_POSITION_HOST_CAP,
            {
              attach(next: any) {
                connection = next;
                next.onResolved?.({ side: 'left', align: 'end', strategy: 'absolute' });
                return lease;
              },
            },
          ],
        ]);
      },
    });
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<OverlayPort>('overlay');

    expect(connection).toMatchObject({
      anchor,
      floating: content,
      config: {
        side: 'right',
        align: 'end',
        sideOffset: 8,
        avoidCollisions: true,
        collisionBoundary: 'clippingAncestors',
        collisionPadding: 6,
      },
    });
    expect(port?.getPositionSnapshot()).toEqual({
      side: 'left',
      align: 'end',
      strategy: 'absolute',
    });

    result.invokeInCallbackScope(() => overlay.close('programmatic'));
    expect(disposed).toBeGreaterThan(0);
  });

  it('OVERLAY-0100: repeated asOverlay calls reuse one handle and merge configuration', () => {
    let a!: OverlayHandle<PropsBaseType>;
    let b!: OverlayHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-overlay-0100',
      setup() {
        a = asOverlay<PropsBaseType>();
        a.configure({ placement: 'bottom', defaultOpen: true });
        b = asOverlay<PropsBaseType>();
        b.configure({ placement: 'top', closeOnOutsidePress: false });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<OverlayPort>('overlay');

    expect(a).toBe(b);
    expect(port?.isOpen()).toBe(true);
    expect(port?.getConfig()).toMatchObject({
      defaultOpen: true,
      placement: 'top',
      closeOnOutsidePress: false,
      closeOnEscape: false,
      align: 'start',
      restore: 'trigger',
    });
    expect(port?.getWarnings()).toEqual(
      expect.arrayContaining([expect.stringContaining('placement overridden')])
    );
    expect((P as any).__asHooks).toEqual([
      { name: 'asOverlay', order: 0, privileged: true, mode: 'once' },
    ]);
  });

  it('OVERLAY-0200: configure is setup-only on overlay handles', () => {
    let overlay!: OverlayHandle<PropsBaseType>;
    let thrown: unknown;

    const P = definePrototype({
      name: 'x-overlay-0200',
      setup(def) {
        overlay = asOverlay<PropsBaseType>();
        def.lifecycle.onCreated(() => {
          try {
            overlay.configure({ placement: 'right' });
          } catch (error) {
            thrown = error;
          }
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    executeWithHost(P as any, host as any);

    expect(thrown).toBeTruthy();
    expect(String(thrown)).toMatch(/setup/i);
  });

  it('OVERLAY-0300: imperative open close toggle updates state and last reason', () => {
    let overlay!: OverlayHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-overlay-0300',
      setup(def) {
        overlay = asOverlay<PropsBaseType>();
        def.lifecycle.onCreated(() => {
          overlay.openOverlay('trigger.press');
          overlay.toggle('item.commit');
          overlay.openOverlay('controlled.sync');
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<OverlayPort>('overlay');

    expect(port?.isOpen()).toBe(true);
    expect(port?.getLastReason()).toBe('controlled.sync');
  });

  it('OVERLAY-0400: registration methods retain trigger anchor and content references', () => {
    let overlay!: OverlayHandle<PropsBaseType>;
    const trigger = { id: 'trigger' };
    const anchor = { id: 'anchor' };
    const content = { id: 'content' };

    const P = definePrototype({
      name: 'x-overlay-0400',
      setup() {
        overlay = asOverlay<PropsBaseType>();
        overlay.registerTrigger(trigger);
        overlay.registerAnchor(anchor);
        overlay.registerContent(content);
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<OverlayPort>('overlay');

    expect(port?.getRegistration()).toEqual({
      trigger,
      anchor,
      content,
    });
  });

  it('OVERLAY-0500: boundary outside notifications close an open overlay when closeOnOutsidePress is enabled', () => {
    let overlay!: OverlayHandle<PropsBaseType>;
    const outsider = document.createElement('button');

    const P = definePrototype({
      name: 'x-overlay-0500',
      setup(def) {
        overlay = asOverlay<PropsBaseType>();
        overlay.configure({ closeOnOutsidePress: true, defaultOpen: true });
        def.lifecycle.onMounted(() => {
          overlay.registerTrigger(document.createElement('button'));
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name, {
      onRuntimeReady(wiring) {
        wiring.attach('event', [[EVENT_GLOBAL_TARGET_CAP, () => outsider]]);
        wiring.attach('boundary', [
          [
            BOUNDARY_HOST_BRIDGE_CAP,
            {
              classify({ sample }: any) {
                return sample?.target === outsider ? 'outside' : 'unknown';
              },
            },
          ],
        ]);
      },
    });
    const result = executeWithHost(P as any, host as any);
    const overlayPort = result.caps.getPort<OverlayPort>('overlay');

    expect(overlayPort?.isOpen()).toBe(true);
    outsider.dispatchEvent(new Event('host:pointerdown'));
    expect(overlayPort?.isOpen()).toBe(false);
    expect(overlayPort?.getLastReason()).toBe('outside.press');
  });

  it('OVERLAY-0550: an opted-in Escape policy closes through the runtime event transport', () => {
    const globalTarget = new EventTarget();

    const P = definePrototype({
      name: 'x-overlay-0550',
      setup() {
        const overlay = asOverlay<PropsBaseType>();
        overlay.configure({ closeOnEscape: true, defaultOpen: true });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name, {
      onRuntimeReady(wiring) {
        wiring.attach('event', [[EVENT_GLOBAL_TARGET_CAP, () => globalTarget]]);
      },
    });
    const result = executeWithHost(P as any, host as any);
    const overlayPort = result.caps.getPort<OverlayPort>('overlay');

    expect(overlayPort?.isOpen()).toBe(true);
    globalTarget.dispatchEvent(new CustomEvent('key.down', { detail: { key: 'Escape' } }));
    expect(overlayPort?.isOpen()).toBe(false);
    expect(overlayPort?.getLastReason()).toBe('escape');
  });

  it('OVERLAY-0600: unbound overlay uses one immediate ViewIntent driver', () => {
    let overlay!: OverlayHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-overlay-0600',
      setup() {
        overlay = asOverlay<PropsBaseType>();
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);

    expect(result.session.viewIntent.getSnapshot().present).toBe(false);
    result.invokeInCallbackScope(() => overlay.openOverlay('programmatic'));
    expect(result.session.viewIntent.getSnapshot().present).toBe(true);
    result.invokeInCallbackScope(() => overlay.close('programmatic'));
    expect(result.session.viewIntent.getSnapshot().present).toBe(false);
  });

  it('OVERLAY-0700: keepMounted preserves structural presence while logical open still changes', () => {
    let overlay!: OverlayHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-overlay-0700',
      setup() {
        overlay = asOverlay<PropsBaseType>();
        overlay.keepMounted();
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);

    expect(result.session.viewIntent.getSnapshot().present).toBe(true);
    result.invokeInCallbackScope(() => overlay.openOverlay('programmatic'));
    result.invokeInCallbackScope(() => overlay.close('programmatic'));
    expect(overlay.isOpen()).toBe(false);
    expect(result.session.viewIntent.getSnapshot().present).toBe(true);
  });

  it('OVERLAY-0800: bound host resources reconcile after the outer callback chain', () => {
    let overlay!: OverlayHandle<PropsBaseType>;
    let present = false;
    const watchers = new Set<(run: unknown, event: any) => void>();
    const presentHandle: ObservedStateHandle<boolean, PropsBaseType> = {
      get: () => present,
      watch(cb) {
        watchers.add(cb as any);
        return () => watchers.delete(cb as any);
      },
    };
    const setPresent = (next: boolean) => {
      if (next === present) return;
      const prev = present;
      present = next;
      for (const watcher of [...watchers]) {
        watcher(undefined, { type: 'next', next, prev });
      }
    };
    const hostElement = document.createElement('div');
    const mounted: HTMLElement[] = [];

    const P = definePrototype({
      name: 'x-overlay-0800',
      setup() {
        overlay = asOverlay<PropsBaseType>();
        overlay.configure({ portal: true });
        overlay.bindPresence({
          enter: () => setPresent(true),
          leave: () => setPresent(false),
          present: presentHandle,
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name, {
      onRuntimeReady(wiring) {
        wiring.attach('overlay', [
          [HOST_ELEMENT_CAP, hostElement],
          [
            OVERLAY_GLOBAL_MOUNT_CAP,
            {
              mount: (element: HTMLElement) => mounted.push(element),
              unmount: () => {},
            },
          ],
        ]);
      },
    });
    const result = executeWithHost(P as any, host as any);

    result.invokeInCallbackScope(() => {
      overlay.openOverlay('programmatic');
      expect(mounted).toEqual([]);
    });

    expect(mounted).toEqual([hostElement]);
  });
});
