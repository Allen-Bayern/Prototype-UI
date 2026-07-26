import { cap } from '@proto.ui/core';
import type { Prototype } from '@proto.ui/core';

export type AsTriggerInstanceToken = unknown;

export type AsTriggerParentGetter = (
  instance: AsTriggerInstanceToken
) => AsTriggerInstanceToken | null;

export type AsTriggerPrototypeGetter = (instance: AsTriggerInstanceToken) => Prototype | null;

export type AsTriggerGroupMerger = (
  instance: AsTriggerInstanceToken,
  anchor: AsTriggerInstanceToken
) => void;

export type AsTriggerGroupEventTargetGetter = (
  instance: AsTriggerInstanceToken
) => EventTarget | null;

export const AS_TRIGGER_INSTANCE_CAP = cap<AsTriggerInstanceToken>(
  '@proto.ui/as-trigger/instanceToken'
);

export const AS_TRIGGER_PARENT_CAP = cap<AsTriggerParentGetter>('@proto.ui/as-trigger/getParent');

export const AS_TRIGGER_GET_PROTO_CAP = cap<AsTriggerPrototypeGetter>(
  '@proto.ui/as-trigger/getPrototype'
);

export const AS_TRIGGER_MERGE_GROUP_CAP = cap<AsTriggerGroupMerger>(
  '@proto.ui/as-trigger/mergeGroup'
);

export const AS_TRIGGER_GET_GROUP_EVENT_TARGET_CAP = cap<AsTriggerGroupEventTargetGetter>(
  '@proto.ui/as-trigger/getGroupEventTarget'
);

/** @deprecated Use AsTriggerGroupMerger. */
export type AsTriggerRouteOwnerSetter = AsTriggerGroupMerger;
/** @deprecated Use AsTriggerGroupEventTargetGetter. */
export type AsTriggerEventTargetGetter = AsTriggerGroupEventTargetGetter;
/** @deprecated Use AS_TRIGGER_MERGE_GROUP_CAP. */
export const AS_TRIGGER_SET_ROUTE_OWNER_CAP = AS_TRIGGER_MERGE_GROUP_CAP;
/** @deprecated Use AS_TRIGGER_GET_GROUP_EVENT_TARGET_CAP. */
export const AS_TRIGGER_GET_EVENT_TARGET_CAP = AS_TRIGGER_GET_GROUP_EVENT_TARGET_CAP;
