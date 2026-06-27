import { describe, expect, it } from 'vitest';
import {
  createFocusScopeKey,
  definePrototype,
  tw,
  type FocusScopeHandle,
  type FocusableHandle,
} from '@proto.ui/core';
import { asFocusable, asFocusScope } from '@proto.ui/hooks';
import type { RuntimeHost } from '../../src';
import { executeWithHost } from '../../src';
import { EVENT_GLOBAL_TARGET_CAP, EVENT_ROOT_TARGET_CAP } from '@proto.ui/module-event';
import type { FocusPort } from '@proto.ui/module-focus';
import type { PropsBaseType } from '@proto.ui/types';

function createMockTarget() {
  type Rec = { type: string; fn: (ev: any) => void; options?: unknown };
  const listeners: Rec[] = [];

  return {
    addEventListener(type: string, fn: (ev: any) => void, options?: unknown) {
      listeners.push({ type, fn, options });
    },
    removeEventListener(type: string, fn: (ev: any) => void, options?: unknown) {
      for (let i = listeners.length - 1; i >= 0; i--) {
        const rec = listeners[i]!;
        if (rec.type !== type || rec.fn !== fn || rec.options !== options) continue;
        listeners.splice(i, 1);
        return;
      }
    },
    dispatchEvent() {
      return true;
    },
    fire(type: string, ev: any = { type }) {
      for (const rec of listeners.filter((item) => item.type === type).slice()) {
        rec.fn(ev);
      }
    },
  } as EventTarget & { fire(type: string, ev?: any): void };
}

const createHost = <P extends PropsBaseType>(
  name: string,
  targets?: { root?: EventTarget | null; global?: EventTarget | null }
) => {
  const rootTarget = targets?.root === undefined ? createMockTarget() : targets.root;
  const globalTarget = targets?.global === undefined ? createMockTarget() : targets.global;

  const host: RuntimeHost<P> = {
    prototypeName: name,
    getRawProps: () => ({}) as any,
    commit(_children, signal) {
      signal?.done();
    },
    schedule(task) {
      task();
    },
    onRuntimeReady(wiring) {
      wiring.attach('event', [
        [EVENT_ROOT_TARGET_CAP, () => rootTarget ?? null],
        [EVENT_GLOBAL_TARGET_CAP, () => globalTarget ?? null],
      ]);
    },
  };

  return { host };
};

describe('runtime contract: focus (v0)', () => {
  it('FOCUS-0100: repeated asFocusable calls reuse one handle and last compatible scopeKey wins', () => {
    const first = createFocusScopeKey({ debugLabel: 'first' });
    const second = createFocusScopeKey({ debugLabel: 'second' });
    let a!: FocusableHandle<PropsBaseType>;
    let b!: FocusableHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-0100',
      setup() {
        a = asFocusable<PropsBaseType>();
        a.configure({ scopeKey: first });
        b = asFocusable<PropsBaseType>();
        b.configure({ scopeKey: second });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(a).toBe(b);
    expect(port?.getEffectiveScopeKey()).toBe(second);
    expect(port?.getFocusableConfig()).toMatchObject({
      autoFocus: false,
      disabled: false,
      navParticipation: 'auto',
      scopeKey: second,
    });
    expect(port?.getWarnings()).toEqual([expect.stringContaining('focusable.scopeKey overridden')]);
    expect((P as any).__asHooks).toEqual([
      { name: 'asFocusable', order: 0, privileged: true, mode: 'once' },
    ]);
  });

  it('FOCUS-0200: repeated asFocusScope calls reuse one handle and key patch is retained', () => {
    const scopeKey = createFocusScopeKey({ debugLabel: 'scope-2' });
    let scopeA!: FocusScopeHandle<PropsBaseType>;
    let scopeB!: FocusScopeHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-0200',
      setup() {
        scopeA = asFocusScope<PropsBaseType>({ navigation: 'tab' });
        scopeB = asFocusScope<PropsBaseType>({ key: scopeKey, navigation: 'arrow', loop: true });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(scopeA).toBe(scopeB);
    expect(port?.getEffectiveScopeKey()).toBe(scopeKey);
    expect(port?.getScopeConfig()).toMatchObject({
      key: scopeKey,
      navigation: 'arrow',
      loop: true,
      orientation: 'vertical',
      entry: 'first',
      restore: 'none',
      emptyPolicy: 'none',
      trap: false,
    });
    expect(port?.getWarnings()).toEqual(
      expect.arrayContaining([
        expect.stringContaining('scope.navigation overridden'),
        expect.stringContaining('scope.loop overridden'),
      ])
    );
    expect((P as any).__asHooks).toEqual([
      { name: 'asFocusScope', order: 0, privileged: true, mode: 'once' },
    ]);
  });

  it('FOCUS-0300: configure is setup-only on focus handles', () => {
    const key = createFocusScopeKey({ debugLabel: 'late' });
    let focusable!: FocusableHandle<PropsBaseType>;
    let thrown: unknown;

    const P = definePrototype({
      name: 'x-focus-0300',
      setup(def) {
        focusable = asFocusable<PropsBaseType>();
        def.lifecycle.onCreated(() => {
          try {
            focusable.configure({ scopeKey: key });
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

  it('FOCUS-0400: focus commands update minimal facts snapshot', () => {
    let focusable!: FocusableHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-0400',
      setup(def) {
        focusable = asFocusable<PropsBaseType>();
        focusable.configure({ disabled: false });
        def.lifecycle.onCreated(() => {
          focusable.focus({ reason: 'keyboard' });
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(port?.getFacts()).toEqual({
      focused: true,
      focusVisible: true,
      focusable: true,
      active: true,
      hasFocused: true,
    });
  });

  it('FOCUS-0450: host focus events update focus-owned observed facts', () => {
    let focusable!: FocusableHandle<PropsBaseType>;
    const root = createMockTarget();
    const global = createMockTarget();

    const P = definePrototype({
      name: 'x-focus-0450',
      setup() {
        focusable = asFocusable<PropsBaseType>();
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name, { root, global });
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(focusable.focused.get()).toBe(false);
    expect((focusable.focused as any).__stateId).toBeTruthy();
    expect((focusable.focused as any).__stateSemantic).toBe('@focus/focused');
    expect((focusable.focusVisible as any).__stateSemantic).toBe('@focus/focusVisible');
    global.fire('key.down', { type: 'key.down' });
    root.fire('host:focus', { type: 'host:focus' });
    expect(focusable.focused.get()).toBe(true);
    expect(focusable.focusVisible.get()).toBe(true);
    expect(port?.getFacts().active).toBe(true);

    root.fire('pointer.down', { type: 'pointer.down' });
    expect(focusable.focusVisible.get()).toBe(false);

    root.fire('host:blur', { type: 'host:blur' });
    expect(focusable.focused.get()).toBe(false);
    expect(port?.getFacts().active).toBe(false);
  });

  it('FOCUS-0460: focus fact handles are rule-consumable state handles', () => {
    let focusable!: FocusableHandle<PropsBaseType>;
    const root = createMockTarget();
    const global = createMockTarget();

    const P = definePrototype({
      name: 'x-focus-0460',
      setup(def) {
        focusable = asFocusable<PropsBaseType>();
        def.rule({
          when: (w) => w.state(focusable.focusVisible).eq(true),
          intent: (i) => i.feedback.style.use(tw('ring-2')),
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name, { root, global });
    const result = executeWithHost(P as any, host as any);

    expect(result.controller.getRuleStyleTokens()).not.toContain('ring-2');

    global.fire('key.down', { type: 'key.down' });
    root.fire('host:focus', { type: 'host:focus' });
    expect(result.controller.getRuleStyleTokens()).toContain('ring-2');
  });

  it('FOCUS-0500: disabled focusable rejects focus requests', () => {
    let focusable!: FocusableHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-0500',
      setup(def) {
        focusable = asFocusable<PropsBaseType>();
        focusable.configure({ disabled: true });
        def.lifecycle.onCreated(() => {
          focusable.focus({ reason: 'keyboard' });
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(port?.getFacts()).toEqual({
      focused: false,
      focusVisible: false,
      focusable: false,
      active: false,
      hasFocused: false,
    });
  });

  it('FOCUS-0600: autoFocus requests focus after first render commit', () => {
    const P = definePrototype({
      name: 'x-focus-0600',
      setup() {
        const focusable = asFocusable<PropsBaseType>();
        focusable.configure({ autoFocus: true });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(port?.getFacts()).toEqual({
      focused: true,
      focusVisible: false,
      focusable: true,
      active: true,
      hasFocused: true,
    });
  });

  it('FOCUS-0700: scope emptyPolicy=container activates scope without node focus', () => {
    let scope!: FocusScopeHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-0700',
      setup(def) {
        scope = asFocusScope<PropsBaseType>({ emptyPolicy: 'container' });
        def.lifecycle.onCreated(() => {
          scope.focusFirst();
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(port?.getFacts()).toEqual({
      focused: false,
      focusVisible: false,
      focusable: false,
      active: true,
      hasFocused: false,
    });
  });
});
