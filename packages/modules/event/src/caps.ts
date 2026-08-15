// packages/modules/event/src/caps.ts
import { cap } from '@proto.ui/core';

export type EventTargetGetter = () => EventTarget | null;

export const EVENT_ROOT_TARGET_CAP = cap<EventTargetGetter>('@proto.ui/event/getRootTarget');

export const EVENT_GLOBAL_TARGET_CAP = cap<EventTargetGetter>('@proto.ui/event/getGlobalTarget');

export type ExposeEventSink = (
  key: string,
  payload?: any,
  options?: Record<string, unknown>
) => void;

/** Receives one validated Component-to-App-Maker outward signal emission. */
export const EXPOSE_EVENT_SINK_CAP = cap<ExposeEventSink>('@proto.ui/event/emit');

/** @deprecated Use EXPOSE_EVENT_SINK_CAP. */
export const EVENT_EMIT_CAP = EXPOSE_EVENT_SINK_CAP;

/** @deprecated Use ExposeEventSink. */
export type EventEmitSink = ExposeEventSink;

export type EventDefaultActionCancelRequest = Readonly<{
  event?: unknown;
  reason?: string;
  source?: string;
}>;

export type EventDefaultActionCancel = (request: EventDefaultActionCancelRequest) => void;

export const EVENT_CANCEL_DEFAULT_ACTION_CAP = cap<EventDefaultActionCancel>(
  '@proto.ui/event/cancelDefaultAction'
);
