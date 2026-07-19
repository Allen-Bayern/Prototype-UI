import dialogClose from './close.proto';
import dialogContent from './content.proto';
import dialogDescription from './description.proto';
import dialogMask from './overlay.proto';
import dialogRoot from './root.proto';
import dialogTitle from './title.proto';
import dialogTrigger from './trigger.proto';

export type {
  ShadcnDialogRootProps,
  ShadcnDialogRootExposes,
  ShadcnDialogRootAsHookContract,
  ShadcnDialogTriggerProps,
  ShadcnDialogTriggerExposes,
  ShadcnDialogTriggerAsHookContract,
  ShadcnDialogMaskProps,
  ShadcnDialogMaskExposes,
  ShadcnDialogMaskAsHookContract,
  ShadcnDialogContentProps,
  ShadcnDialogContentExposes,
  ShadcnDialogContentAsHookContract,
  ShadcnDialogTitleProps,
  ShadcnDialogTitleExposes,
  ShadcnDialogTitleAsHookContract,
  ShadcnDialogDescriptionProps,
  ShadcnDialogDescriptionExposes,
  ShadcnDialogDescriptionAsHookContract,
  ShadcnDialogCloseProps,
  ShadcnDialogCloseExposes,
  ShadcnDialogCloseAsHookContract,
} from './types';

export {
  dialogRoot,
  dialogTrigger,
  dialogMask,
  dialogContent,
  dialogTitle,
  dialogDescription,
  dialogClose,
};

export { default as shadcnDialogRoot } from './root.proto';
export { default as shadcnDialogTrigger } from './trigger.proto';
export { default as shadcnDialogMask } from './overlay.proto';
export { default as shadcnDialogContent } from './content.proto';
export { default as shadcnDialogTitle } from './title.proto';
export { default as shadcnDialogDescription } from './description.proto';
export { default as shadcnDialogClose } from './close.proto';
