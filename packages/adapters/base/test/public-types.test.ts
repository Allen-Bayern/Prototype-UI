import { describe, expectTypeOf, it } from 'vitest';
import {
  definePrototype,
  type ExposeEvent,
  type ExposeMethod,
  type ExposeState,
  type ExposeValue,
} from '@proto.ui/core';
import type { ExposeStateExternalHandle } from '@proto.ui/module-expose-state';

import type { ProtoAdapterExposes, ProtoAdapterProps } from '../src';

type DemoProps = {
  label?: string;
};

type DemoExposes = {
  ready: ExposeEvent<void>;
  focusSelf: ExposeMethod<(options?: { preventScroll?: boolean }) => void>;
  version: ExposeValue<number>;
  checked: ExposeState<boolean>;
  legacy: { ping(): string };
};

const proto = definePrototype<DemoProps, DemoExposes>({
  name: 'adapter-public-type-demo',
  setup() {
    return (renderer) => [renderer.el('div', 'ok')];
  },
});

describe('adapter-base: public type projection', () => {
  it('preserves Prototype props', () => {
    expectTypeOf<ProtoAdapterProps<typeof proto>>().toEqualTypeOf<DemoProps>();
  });

  it('projects values, methods, states, and legacy entries without leaking event markers', () => {
    expectTypeOf<ProtoAdapterExposes<typeof proto>>().toEqualTypeOf<{
      focusSelf: (options?: { preventScroll?: boolean }) => void;
      version: number;
      checked: ExposeStateExternalHandle<boolean>;
      legacy: { ping(): string };
    }>();
  });
});
