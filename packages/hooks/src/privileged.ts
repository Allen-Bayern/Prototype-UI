import type { AsHookMode, AsHookRuntime, DefHandle } from '@proto.ui/core';
import { getActiveAsHookContext } from '@proto.ui/core/internal';
import type { PropsBaseType } from '@proto.ui/types';

type PrivilegedAsHookRegistration = ReturnType<AsHookRuntime['register']>;

export type PrivilegedAsHookContext<P extends PropsBaseType = PropsBaseType> = Readonly<{
  def: DefHandle<P, Record<string, unknown>>;
  rt: AsHookRuntime;
  facades: Record<string, unknown>;
  ports: Record<string, unknown>;
  registration: PrivilegedAsHookRegistration;
}>;

export type PrivilegedAsHookDefinition<P extends PropsBaseType, Result> = Readonly<{
  name: string;
  mode?: AsHookMode;
  setup: (ctx: PrivilegedAsHookContext<P>) => Result;
  reuse?: (ctx: PrivilegedAsHookContext<P>) => Result;
}>;

export function definePrivilegedAsHook<P extends PropsBaseType, Result>(
  definition: PrivilegedAsHookDefinition<P, Result>
): () => Result {
  return () => {
    const active = getActiveAsHookContext(definition.name);
    active.rt.ensureSetup(`asHook(${definition.name})`);

    const registration = active.rt.register(definition.name, {
      privileged: true,
      mode: definition.mode ?? 'once',
    });
    const ctx: PrivilegedAsHookContext<P> = {
      def: active.def as DefHandle<P, Record<string, unknown>>,
      rt: active.rt,
      facades: active.facades,
      ports: active.ports,
      registration,
    };

    if (registration.action === 'skip') {
      if (definition.reuse) return definition.reuse(ctx);
      return registration.state.result as Result;
    }

    const result = definition.setup(ctx);
    registration.state.result = result as any;
    return result;
  };
}
