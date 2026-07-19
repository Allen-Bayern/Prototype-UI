import hoverCardContent from './content.proto';
import hoverCardRoot from './root.proto';
import hoverCardTrigger from './trigger.proto';

export type {
  ShadcnHoverCardRootProps,
  ShadcnHoverCardRootExposes,
  ShadcnHoverCardRootAsHookContract,
  ShadcnHoverCardTriggerProps,
  ShadcnHoverCardTriggerExposes,
  ShadcnHoverCardTriggerAsHookContract,
  ShadcnHoverCardContentProps,
  ShadcnHoverCardContentExposes,
  ShadcnHoverCardContentAsHookContract,
} from './types';

export { hoverCardRoot, hoverCardTrigger, hoverCardContent };
export { default as shadcnHoverCardRoot } from './root.proto';
export { default as shadcnHoverCardTrigger } from './trigger.proto';
export { default as shadcnHoverCardContent } from './content.proto';
