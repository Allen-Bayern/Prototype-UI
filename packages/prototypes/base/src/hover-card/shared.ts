import { createAnatomyFamily, createContextKey } from '@proto.ui/core';

export type HoverCardInteractionReason =
  | 'trigger.pointerenter'
  | 'trigger.pointerleave'
  | 'trigger.focus'
  | 'trigger.blur'
  | 'content.pointerenter'
  | 'content.pointerleave';

export type HoverCardContextValue = {
  // P-BASE-HOVER-CARD-CONTEXT
  open: boolean;
  controlled: boolean;
  disabled: boolean;
  openDelay: number;
  closeDelay: number;
  triggerHovered: boolean;
  triggerFocused: boolean;
  contentHovered: boolean;
  interactionReason: HoverCardInteractionReason | null;
  interactionVersion: number;
  requestedOpen: boolean;
  requestReason: string | null;
  requestVersion: number;
};

export function deriveHoverCardInteractionOpen(ctx: HoverCardContextValue): boolean {
  // P-BASE-HOVER-CARD-INTERACTION-INTENT, P-BASE-HOVER-CARD-CONTENT-HOVER-BRIDGE
  return ctx.triggerHovered || ctx.triggerFocused || ctx.contentHovered;
}

export function updateHoverCardInteraction(
  run: any,
  patch: Partial<
    Pick<HoverCardContextValue, 'triggerHovered' | 'triggerFocused' | 'contentHovered'>
  >,
  reason: HoverCardInteractionReason
): boolean {
  try {
    run.context.update(HOVER_CARD_CONTEXT, (prev: HoverCardContextValue) => ({
      ...prev,
      ...patch,
      interactionReason: reason,
      interactionVersion: prev.interactionVersion + 1,
    }));
    return true;
  } catch (error) {
    if ((error as { code?: string })?.code === 'CONTEXT_DISCONNECTED') return false;
    throw error;
  }
}

export function requestHoverCardOpen(run: any, nextOpen: boolean, reason: string): boolean {
  // P-BASE-HOVER-CARD-OPEN-CHANGE, P-BASE-HOVER-CARD-CONTROLLED-OWNER
  try {
    run.context.update(HOVER_CARD_CONTEXT, (prev: HoverCardContextValue) => ({
      ...prev,
      open: prev.controlled ? prev.open : nextOpen,
      requestedOpen: nextOpen,
      requestReason: reason,
      requestVersion: prev.requestVersion + 1,
    }));
    return true;
  } catch (error) {
    if ((error as { code?: string })?.code === 'CONTEXT_DISCONNECTED') return false;
    throw error;
  }
}

// P-BASE-HOVER-CARD-ANATOMY
export const HOVER_CARD_FAMILY = createAnatomyFamily('base-hover-card', {
  roles: {
    root: { cardinality: { min: 1, max: 1 } },
    trigger: { cardinality: { min: 0, max: 1 } },
    content: { cardinality: { min: 0, max: 1 } },
  },
  relations: [
    { kind: 'contains', parent: 'root', child: 'trigger' },
    { kind: 'contains', parent: 'root', child: 'content' },
  ],
});

// P-BASE-HOVER-CARD-CONTEXT
export const HOVER_CARD_CONTEXT = createContextKey<HoverCardContextValue>('base-hover-card');
