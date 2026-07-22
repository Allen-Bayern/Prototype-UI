import { cap } from '@proto.ui/core';
import type { Prototype } from '@proto.ui/core';

export type AsTriggerInstanceToken = unknown;

export type AsTriggerParentGetter = (
  instance: AsTriggerInstanceToken
) => AsTriggerInstanceToken | null;

export type AsTriggerPrototypeGetter = (instance: AsTriggerInstanceToken) => Prototype | null;

export type AsTriggerRouteOwnerSetter = (
  instance: AsTriggerInstanceToken,
  owner: AsTriggerInstanceToken
) => void;

export type AsTriggerEventTargetGetter = (instance: AsTriggerInstanceToken) => EventTarget | null;

export const AS_TRIGGER_INSTANCE_CAP = cap<AsTriggerInstanceToken>(
  '@proto.ui/as-trigger/instanceToken'
);

export const AS_TRIGGER_PARENT_CAP = cap<AsTriggerParentGetter>('@proto.ui/as-trigger/getParent');

export const AS_TRIGGER_GET_PROTO_CAP = cap<AsTriggerPrototypeGetter>(
  '@proto.ui/as-trigger/getPrototype'
);

export const AS_TRIGGER_SET_ROUTE_OWNER_CAP = cap<AsTriggerRouteOwnerSetter>(
  '@proto.ui/as-trigger/setRouteOwner'
);

export const AS_TRIGGER_GET_EVENT_TARGET_CAP = cap<AsTriggerEventTargetGetter>(
  '@proto.ui/as-trigger/getEventTarget'
);
