import { describe, expect, it } from 'vitest';
import { createFocusRovingKey, definePrototype, type FocusRovingHandle } from '@proto.ui/core';
import { asFocusable, asFocusRoving, asFocusScope } from '@proto.ui/hooks';
import type { RuntimeHost } from '../../src';
import { executeWithHost } from '../../src';
import {
  FOCUS_INSTANCE_TOKEN_CAP,
  FOCUS_PARENT_CAP,
  FOCUS_REQUEST_FOCUS_CAP,
  FOCUS_ROOT_TARGET_CAP,
  type FocusPort,
} from '@proto.ui/module-focus';
import {
  EVENT_CANCEL_DEFAULT_ACTION_CAP,
  EVENT_GLOBAL_TARGET_CAP,
  EVENT_ROOT_TARGET_CAP,
} from '@proto.ui/module-event';
import type { PropsBaseType } from '@proto.ui/types';

const createHost = <P extends PropsBaseType>(name: string) => {
  const rootTarget = new EventTarget();
  const globalTarget = new EventTarget();
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
        [EVENT_ROOT_TARGET_CAP, () => rootTarget],
        [EVENT_GLOBAL_TARGET_CAP, () => globalTarget],
      ]);
    },
  };

  return { host };
};

class FocusTarget extends EventTarget {
  constructor(
    readonly id: string,
    private readonly order: Map<string, number>
  ) {
    super();
  }

  compareDocumentPosition(other: FocusTarget): number {
    const a = this.order.get(this.id) ?? 0;
    const b = this.order.get(other.id) ?? 0;
    if (a < b) return Node.DOCUMENT_POSITION_FOLLOWING;
    if (a > b) return Node.DOCUMENT_POSITION_PRECEDING;
    return 0;
  }
}

const createTreeHost = (
  name: string,
  target: FocusTarget,
  options: {
    globalTarget: FocusTarget;
    parents: Map<unknown, unknown | null>;
    focused: string[];
  }
): RuntimeHost<PropsBaseType> => ({
  prototypeName: name,
  getRawProps: () => ({}),
  commit(_children, signal) {
    signal?.done();
  },
  schedule(task) {
    task();
  },
  onRuntimeReady(wiring) {
    wiring.attach('event', [
      [EVENT_ROOT_TARGET_CAP, () => target],
      [EVENT_GLOBAL_TARGET_CAP, () => options.globalTarget],
    ]);
    wiring.attach('focus', [
      [FOCUS_INSTANCE_TOKEN_CAP, target],
      [FOCUS_PARENT_CAP, (instance: unknown) => options.parents.get(instance) ?? null],
      [FOCUS_ROOT_TARGET_CAP, () => target as any],
      [
        FOCUS_REQUEST_FOCUS_CAP,
        (nextTarget: FocusTarget) => {
          options.focused.push(nextTarget.id);
        },
      ],
    ]);
  },
});

describe('runtime contract: focus-roving (v0)', () => {
  it('FOCUS-ROVING-0100: repeated asFocusRoving calls reuse one handle and configure through that handle', () => {
    const first = createFocusRovingKey({ debugLabel: 'roving-1' });
    const second = createFocusRovingKey({ debugLabel: 'roving-2' });
    let a!: FocusRovingHandle<PropsBaseType>;
    let b!: FocusRovingHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-roving-0100',
      setup() {
        a = asFocusRoving<PropsBaseType>();
        a.configure({ key: first, navigation: 'arrow' });
        b = asFocusRoving<PropsBaseType>();
        b.configure({
          key: second,
          orientation: 'horizontal',
          selectOnFocus: true,
        });
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(a).toBe(b);
    expect(port?.getEffectiveRovingKey()).toBe(second);
    expect(port?.getRovingConfig()).toMatchObject({
      key: second,
      navigation: 'arrow',
      orientation: 'horizontal',
      selectOnFocus: true,
      entry: 'first',
      loop: false,
    });
  });

  it('FOCUS-ROVING-0200: asFocusScope exposes its internal roving handle', () => {
    let roving!: FocusRovingHandle<PropsBaseType>;

    const P = definePrototype({
      name: 'x-focus-roving-0200',
      setup() {
        const scope = asFocusScope<PropsBaseType>();
        scope.configure({
          entry: 'selected',
          group: { navigation: 'arrow', orientation: 'horizontal' },
        });
        roving = scope.getRoving()!;
        return (r) => r.el('div', 'ok');
      },
    });

    const { host } = createHost(P.name);
    const result = executeWithHost(P as any, host as any);
    const port = result.caps.getPort<FocusPort>('focus');

    expect(roving).toBeTruthy();
    expect(port?.getRovingConfig()).toMatchObject({
      navigation: 'arrow',
      orientation: 'horizontal',
    });
  });

  it('FOCUS-ROVING-0300: logical parent roving owner owns child focusables without groupKey', () => {
    const Roving = definePrototype({
      name: 'x-focus-roving-0300-owner',
      setup() {
        const roving = asFocusRoving<PropsBaseType>();
        roving.configure({ navigation: 'arrow' });
        return (r) => r.el('div', 'roving');
      },
    });
    const Item = definePrototype({
      name: 'x-focus-roving-0300-item',
      setup() {
        asFocusable<PropsBaseType>();
        return (r) => r.el('button', 'item');
      },
    });

    const order = new Map<string, number>([
      ['roving', 0],
      ['item-a', 1],
      ['item-b', 2],
    ]);
    const globalTarget = new FocusTarget('global', new Map());
    const targets = {
      roving: new FocusTarget('roving', order),
      itemA: new FocusTarget('item-a', order),
      itemB: new FocusTarget('item-b', order),
    };
    const parents = new Map<unknown, unknown | null>([
      [targets.roving, null],
      [targets.itemA, targets.roving],
      [targets.itemB, targets.roving],
    ]);
    const focused: string[] = [];
    const hostOptions = { globalTarget, parents, focused };

    const rovingExec = executeWithHost(
      Roving as any,
      createTreeHost(Roving.name, targets.roving, hostOptions) as any
    );
    executeWithHost(Item as any, createTreeHost(Item.name, targets.itemA, hostOptions) as any);
    executeWithHost(Item as any, createTreeHost(Item.name, targets.itemB, hostOptions) as any);

    rovingExec.caps.getPort<FocusPort>('focus')?.focusFirst();

    expect(focused).toEqual(['item-a']);
  });

  it('FOCUS-ROVING-0320: focusSelected uses semantic member status instead of host order', () => {
    // T-FOCUS-ROVING-0001-CASE-MEMBER-STATUS
    let roving!: FocusRovingHandle<PropsBaseType>;
    const Roving = definePrototype({
      name: 'x-focus-roving-0320-owner',
      setup() {
        roving = asFocusRoving<PropsBaseType>();
        return (r) => r.el('div', 'roving');
      },
    });
    const Item = definePrototype<{ selected?: boolean; active?: boolean }>({
      name: 'x-focus-roving-0320-item',
      setup(def) {
        def.props.define({
          selected: { type: 'boolean', empty: 'fallback' },
          active: { type: 'boolean', empty: 'fallback' },
        });
        const focusable = asFocusable<{ selected?: boolean; active?: boolean }>();
        def.lifecycle.onCreated((run) => {
          focusable.setRovingStatus({
            selected: !!run.props.get().selected,
            active: !!run.props.get().active,
          });
        });
        return (r) => r.el('button', 'item');
      },
    });

    const order = new Map<string, number>([
      ['roving', 0],
      ['item-a', 1],
      ['item-b', 2],
    ]);
    const globalTarget = new FocusTarget('global', new Map());
    const targets = {
      roving: new FocusTarget('roving', order),
      itemA: new FocusTarget('item-a', order),
      itemB: new FocusTarget('item-b', order),
    };
    const parents = new Map<unknown, unknown | null>([
      [targets.roving, null],
      [targets.itemA, targets.roving],
      [targets.itemB, targets.roving],
    ]);
    const focused: string[] = [];
    const hostOptions = { globalTarget, parents, focused };

    executeWithHost(Roving as any, createTreeHost(Roving.name, targets.roving, hostOptions) as any);
    executeWithHost(
      Item as any,
      {
        ...createTreeHost(Item.name, targets.itemA, hostOptions),
        getRawProps: () => ({ active: true }),
      } as any
    );
    executeWithHost(
      Item as any,
      {
        ...createTreeHost(Item.name, targets.itemB, hostOptions),
        getRawProps: () => ({ selected: true }),
      } as any
    );

    roving.focusSelected();
    expect(focused).toEqual(['item-b']);

    roving.focusNext();
    expect(focused).toEqual(['item-b', 'item-b']);
  });

  it('FOCUS-ROVING-0350: arrow navigation requests default-action cancellation through event host cap', () => {
    const Roving = definePrototype({
      name: 'x-focus-roving-0350-owner',
      setup() {
        const roving = asFocusRoving<PropsBaseType>();
        roving.configure({ navigation: 'arrow', orientation: 'horizontal' });
        return (r) => r.el('div', 'roving');
      },
    });
    const Item = definePrototype({
      name: 'x-focus-roving-0350-item',
      setup() {
        asFocusable<PropsBaseType>();
        return (r) => r.el('button', 'item');
      },
    });

    const order = new Map<string, number>([
      ['roving', 0],
      ['item-a', 1],
      ['item-b', 2],
    ]);
    const globalTarget = new FocusTarget('global', new Map());
    const targets = {
      roving: new FocusTarget('roving', order),
      itemA: new FocusTarget('item-a', order),
      itemB: new FocusTarget('item-b', order),
    };
    const parents = new Map<unknown, unknown | null>([
      [targets.roving, null],
      [targets.itemA, targets.roving],
      [targets.itemB, targets.roving],
    ]);
    const focused: string[] = [];
    const cancelled: unknown[] = [];
    const hostOptions = { globalTarget, parents, focused };
    const attachCancelCap = (host: RuntimeHost<PropsBaseType>) => {
      const baseReady = host.onRuntimeReady;
      host.onRuntimeReady = (wiring) => {
        baseReady?.(wiring);
        wiring.attach('event', [
          [
            EVENT_CANCEL_DEFAULT_ACTION_CAP,
            (request: { event?: unknown; reason?: string; source?: string }) => {
              cancelled.push(request);
            },
          ],
        ]);
      };
      return host;
    };

    executeWithHost(
      Roving as any,
      attachCancelCap(createTreeHost(Roving.name, targets.roving, hostOptions)) as any
    );
    const itemA = executeWithHost(
      Item as any,
      attachCancelCap(createTreeHost(Item.name, targets.itemA, hostOptions)) as any
    );
    executeWithHost(
      Item as any,
      attachCancelCap(createTreeHost(Item.name, targets.itemB, hostOptions)) as any
    );

    itemA.caps.getPort<FocusPort>('focus')?.requestFocus({ reason: 'keyboard' });
    globalTarget.dispatchEvent(
      new CustomEvent('key.down', {
        detail: {
          key: 'ArrowRight',
          nativeEvent: { type: 'keydown' },
        },
      })
    );

    expect(focused).toEqual(['item-a', 'item-b']);
    expect(cancelled).toMatchObject([
      {
        reason: 'focus.roving.keyboard',
        source: Roving.name,
      },
    ]);
  });

  it('FOCUS-ROVING-0360: roving movement can focus members outside natural Tab participation', () => {
    let roving!: FocusRovingHandle<PropsBaseType>;
    const Roving = definePrototype({
      name: 'x-focus-roving-0360-owner',
      setup() {
        roving = asFocusRoving<PropsBaseType>();
        roving.configure({ navigation: 'arrow', orientation: 'horizontal' });
        return (r) => r.el('div', 'roving');
      },
    });
    const AutoItem = definePrototype({
      name: 'x-focus-roving-0360-auto-item',
      setup() {
        const focusable = asFocusable<PropsBaseType>();
        focusable.configure({ navParticipation: 'auto' });
        return (r) => r.el('button', 'item');
      },
    });
    const TabExcludedItem = definePrototype({
      name: 'x-focus-roving-0360-tab-excluded-item',
      setup() {
        const focusable = asFocusable<PropsBaseType>();
        focusable.configure({ navParticipation: 'none' });
        return (r) => r.el('button', 'item');
      },
    });

    const order = new Map<string, number>([
      ['roving', 0],
      ['item-a', 1],
      ['item-b', 2],
    ]);
    const globalTarget = new FocusTarget('global', new Map());
    const targets = {
      roving: new FocusTarget('roving', order),
      itemA: new FocusTarget('item-a', order),
      itemB: new FocusTarget('item-b', order),
    };
    const parents = new Map<unknown, unknown | null>([
      [targets.roving, null],
      [targets.itemA, targets.roving],
      [targets.itemB, targets.roving],
    ]);
    const focused: string[] = [];
    const hostOptions = { globalTarget, parents, focused };

    executeWithHost(Roving as any, createTreeHost(Roving.name, targets.roving, hostOptions) as any);
    const itemA = executeWithHost(
      AutoItem as any,
      createTreeHost(AutoItem.name, targets.itemA, hostOptions) as any
    );
    executeWithHost(
      TabExcludedItem as any,
      createTreeHost(TabExcludedItem.name, targets.itemB, hostOptions) as any
    );

    itemA.caps.getPort<FocusPort>('focus')?.requestFocus({ reason: 'keyboard' });
    globalTarget.dispatchEvent(
      new CustomEvent('key.down', {
        detail: {
          key: 'ArrowRight',
          nativeEvent: { type: 'keydown' },
        },
      })
    );

    expect(focused).toEqual(['item-a', 'item-b']);

    targets.itemB.dispatchEvent(new Event('host:focus'));
    roving.setOrientation('vertical');
    globalTarget.dispatchEvent(
      new CustomEvent('key.down', {
        detail: {
          key: 'ArrowRight',
          nativeEvent: { type: 'keydown' },
        },
      })
    );

    expect(focused).toEqual(['item-a', 'item-b']);

    globalTarget.dispatchEvent(
      new CustomEvent('key.down', {
        detail: {
          key: 'ArrowUp',
          nativeEvent: { type: 'keydown' },
        },
      })
    );

    expect(focused).toEqual(['item-a', 'item-b', 'item-a']);
  });

  it('FOCUS-ROVING-0310: scope getRoving handle declares logical roving ownership', () => {
    const Scope = definePrototype({
      name: 'x-focus-roving-0310-scope',
      setup() {
        const scope = asFocusScope<PropsBaseType>();
        scope.getRoving();
        return (r) => r.el('div', 'scope');
      },
    });
    const Item = definePrototype({
      name: 'x-focus-roving-0310-item',
      setup() {
        asFocusable<PropsBaseType>();
        return (r) => r.el('button', 'item');
      },
    });

    const order = new Map<string, number>([
      ['scope', 0],
      ['item', 1],
    ]);
    const globalTarget = new FocusTarget('global', new Map());
    const scopeTarget = new FocusTarget('scope', order);
    const itemTarget = new FocusTarget('item', order);
    const parents = new Map<unknown, unknown | null>([
      [scopeTarget, null],
      [itemTarget, scopeTarget],
    ]);
    const focused: string[] = [];
    const hostOptions = { globalTarget, parents, focused };

    const scopeExec = executeWithHost(
      Scope as any,
      createTreeHost(Scope.name, scopeTarget, hostOptions) as any
    );
    executeWithHost(Item as any, createTreeHost(Item.name, itemTarget, hostOptions) as any);

    scopeExec.caps.getPort<FocusPort>('focus')?.focusFirst();

    expect(focused).toEqual(['item']);
  });
});
