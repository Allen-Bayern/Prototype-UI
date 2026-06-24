import { createAnatomyFamily, createContextKey } from '@proto.ui/core';

export type HoverCardContextValue = {
  open: boolean;
  controlled: boolean;
  disabled: boolean;
  triggerHovered: boolean;
  triggerFocused: boolean;
  contentHovered: boolean;
  contentFocused: boolean;
};

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
export const HOVER_CARD_CONTEXT = createContextKey<HoverCardContextValue>('base-hover-card');
