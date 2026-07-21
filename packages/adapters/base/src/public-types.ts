import type {
  ExposeEvent,
  ExposeMethod,
  ExposeOf,
  ExposeState,
  ExposeValue,
  Prototype,
} from '@proto.ui/core';
import type { ExposeStateExternalHandle } from '@proto.ui/module-expose-state';
import type { PropsBaseType } from '@proto.ui/types';

export type AdapterPrototype = Prototype<any, any>;

export type ProtoAdapterProps<TProto extends AdapterPrototype> =
  TProto extends Prototype<infer Props, any>
    ? Props extends PropsBaseType
      ? Props
      : never
    : never;

type ProtoAdapterExposeValue<TValue> =
  TValue extends ExposeMethod<infer Method>
    ? Method
    : TValue extends ExposeValue<infer Value>
      ? Value
      : TValue extends ExposeState<infer Value>
        ? ExposeStateExternalHandle<Value>
        : TValue;

/**
 * Projects Prototype declaration types to the instance surface available to
 * App Makers. Outward signals are carried by host-native listener props/emits,
 * while values, methods, and states are exposed through the adapter handle.
 */
export type ProtoAdapterExposes<TProto extends AdapterPrototype> = {
  [Key in keyof ExposeOf<TProto> as ExposeOf<TProto>[Key] extends ExposeEvent<any>
    ? never
    : Key]: ProtoAdapterExposeValue<ExposeOf<TProto>[Key]>;
};
