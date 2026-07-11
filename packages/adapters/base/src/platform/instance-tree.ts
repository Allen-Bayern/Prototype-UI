import type { Prototype } from '@proto.ui/core';

const PROTO_PARENT_INSTANCE = Symbol.for('@proto.ui/adapter-base/__proto_parent_instance');

type ElementWithProtoParent = HTMLElement & Record<symbol, unknown>;

export type LogicalInstanceToken = object & {
  readonly __protoUiLogicalInstance?: true;
};

function writeProtoParentMark(instance: HTMLElement, parent: HTMLElement | null): void {
  const target = instance as ElementWithProtoParent;
  if (parent) {
    target[PROTO_PARENT_INSTANCE] = parent;
    return;
  }
  delete target[PROTO_PARENT_INSTANCE];
}

function readProtoParentMark(instance: HTMLElement): HTMLElement | null {
  const mark = (instance as ElementWithProtoParent)[PROTO_PARENT_INSTANCE];
  return mark instanceof HTMLElement ? mark : null;
}

export function createInstanceTreeMarkers(symbolName: string) {
  const PROTO_INSTANCE = Symbol.for(symbolName);
  const PROTO_BY_INSTANCE = new WeakMap<HTMLElement, Prototype<any>>();
  const TOKEN_BY_INSTANCE = new WeakMap<HTMLElement, LogicalInstanceToken>();
  const INSTANCE_BY_TOKEN = new WeakMap<LogicalInstanceToken, HTMLElement>();
  const PROTO_BY_TOKEN = new WeakMap<LogicalInstanceToken, Prototype<any>>();
  const PARENT_BY_TOKEN = new WeakMap<LogicalInstanceToken, LogicalInstanceToken>();

  function createLogicalInstance(proto: Prototype<any>): LogicalInstanceToken {
    // Tokens intentionally remain extensible: semantic modules attach
    // cross-adapter ownership marks (for example as-trigger confirmation).
    const token = {} as LogicalInstanceToken;
    PROTO_BY_TOKEN.set(token, proto);
    return token;
  }

  function bindLogicalParent(
    token: LogicalInstanceToken,
    parent: LogicalInstanceToken | null
  ): void {
    if (parent) PARENT_BY_TOKEN.set(token, parent);
    else PARENT_BY_TOKEN.delete(token);
  }

  function markProtoInstance(
    el: HTMLElement,
    proto: Prototype<any>,
    token: LogicalInstanceToken = createLogicalInstance(proto)
  ): LogicalInstanceToken {
    (el as any)[PROTO_INSTANCE] = true;
    PROTO_BY_INSTANCE.set(el, proto);
    TOKEN_BY_INSTANCE.set(el, token);
    INSTANCE_BY_TOKEN.set(token, el);
    PROTO_BY_TOKEN.set(token, proto);

    const parentRoot = getProtoParent(el);
    const parentToken = parentRoot ? TOKEN_BY_INSTANCE.get(parentRoot) : undefined;
    if (parentToken) PARENT_BY_TOKEN.set(token, parentToken);
    return token;
  }

  function unbindProtoInstance(token: LogicalInstanceToken, el?: HTMLElement): void {
    const current = INSTANCE_BY_TOKEN.get(token);
    if (!current || (el && current !== el)) return;
    INSTANCE_BY_TOKEN.delete(token);
    TOKEN_BY_INSTANCE.delete(current);
    PROTO_BY_INSTANCE.delete(current);
    delete (current as any)[PROTO_INSTANCE];
  }

  const PROTO_PARENT_BY_INSTANCE = new WeakMap<HTMLElement, HTMLElement>();

  function setProtoParent(instance: HTMLElement, parent: HTMLElement | null): void {
    if (parent) {
      PROTO_PARENT_BY_INSTANCE.set(instance, parent);
      writeProtoParentMark(instance, parent);
    } else {
      PROTO_PARENT_BY_INSTANCE.delete(instance);
      writeProtoParentMark(instance, null);
    }

    const token = TOKEN_BY_INSTANCE.get(instance);
    if (!token) return;
    const parentRoot = parent ? (isProtoInstance(parent) ? parent : getProtoParent(parent)) : null;
    const parentToken = parentRoot ? TOKEN_BY_INSTANCE.get(parentRoot) : undefined;
    if (parentToken) PARENT_BY_TOKEN.set(token, parentToken);
    else PARENT_BY_TOKEN.delete(token);
  }

  function getProtoParent(instance: HTMLElement): HTMLElement | null {
    let cur: Node | null =
      readProtoParentMark(instance) ??
      PROTO_PARENT_BY_INSTANCE.get(instance) ??
      instance.parentNode;
    while (cur) {
      if (typeof ShadowRoot !== 'undefined' && cur instanceof ShadowRoot) {
        cur = cur.host;
        continue;
      }
      if (isProtoInstance(cur)) return cur as HTMLElement;

      if (cur instanceof HTMLElement) {
        const linkedParent =
          readProtoParentMark(cur) ?? PROTO_PARENT_BY_INSTANCE.get(cur as HTMLElement) ?? null;
        if (linkedParent && linkedParent !== cur) {
          cur = linkedParent;
          continue;
        }
      }

      cur = cur.parentNode;
    }
    return null;
  }

  function getPrototypeByInstance(instance: HTMLElement): Prototype<any> | null {
    return PROTO_BY_INSTANCE.get(instance) ?? null;
  }

  function getLogicalParent(token: LogicalInstanceToken): LogicalInstanceToken | null {
    return PARENT_BY_TOKEN.get(token) ?? null;
  }

  function getLogicalRoot(token: LogicalInstanceToken): HTMLElement | null {
    return INSTANCE_BY_TOKEN.get(token) ?? null;
  }

  function getLogicalPrototype(token: LogicalInstanceToken): Prototype<any> | null {
    return PROTO_BY_TOKEN.get(token) ?? null;
  }

  function isProtoInstance(node: Node | null): node is HTMLElement {
    if (!node) return false;
    return (node as any)[PROTO_INSTANCE] === true;
  }

  return {
    PROTO_INSTANCE,
    createLogicalInstance,
    bindLogicalParent,
    markProtoInstance,
    unbindProtoInstance,
    setProtoParent,
    getProtoParent,
    getPrototypeByInstance,
    getLogicalParent,
    getLogicalRoot,
    getLogicalPrototype,
    isProtoInstance,
  };
}
