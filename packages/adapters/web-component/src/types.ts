import type { Prototype } from '@proto.ui/core';
import type { ProtoAdapterExposes, ProtoAdapterProps } from '@proto.ui/adapter-base';

export type ProtoWebComponentProps<TProto extends Prototype<any, any>> =
  ProtoAdapterProps<TProto> & {
    class?: string | string[] | Record<string, boolean>;
    className?: string | string[] | Record<string, boolean>;
  };

export type WebComponentAdapterHandle<
  TProto extends Prototype<any, any> = Prototype<any, Record<string, unknown>>,
> = {
  update(): void;
  getExposes(): ProtoAdapterExposes<TProto>;
};

export type WebComponentAdapterElement<
  TProto extends Prototype<any, any> = Prototype<any, Record<string, unknown>>,
> = HTMLElement &
  WebComponentAdapterHandle<TProto> & {
    /** Type-only carrier used to recover the Prototype props for host tooling. */
    readonly __protoUiProps?: ProtoWebComponentProps<TProto>;
  };

export type WebComponentAdapterConstructor<
  TProto extends Prototype<any, any> = Prototype<any, Record<string, unknown>>,
> = {
  new (): WebComponentAdapterElement<TProto>;
  prototype: WebComponentAdapterElement<TProto>;
};
