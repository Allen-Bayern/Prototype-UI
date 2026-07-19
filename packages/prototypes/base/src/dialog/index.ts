import dialogRoot from './root.proto';

export type {
  DialogCloseAsHookContract,
  DialogCloseExposes,
  DialogCloseProps,
  DialogContentAsHookContract,
  DialogContentExposes,
  DialogContentHandles,
  DialogContentProps,
  DialogDescriptionAsHookContract,
  DialogDescriptionExposes,
  DialogDescriptionProps,
  DialogMaskAsHookContract,
  DialogMaskExposes,
  DialogMaskHandles,
  DialogMaskProps,
  DialogRootAsHookContract,
  DialogRootExposes,
  DialogRootProps,
  DialogTitleAsHookContract,
  DialogTitleExposes,
  DialogTitleProps,
  DialogTriggerAsHookContract,
  DialogTriggerExposes,
  DialogTriggerProps,
} from './types';
export type { DialogContextValue } from './shared';

export { DIALOG_CONTEXT, DIALOG_FAMILY } from './shared';
export { asDialogRoot, default as dialogRoot } from './root.proto';
export { asDialogTrigger, default as dialogTrigger } from './trigger.proto';
export { asDialogMask, default as dialogMask } from './overlay.proto';
export { asDialogContent, default as dialogContent } from './content.proto';
export { asDialogTitle, default as dialogTitle } from './title.proto';
export { asDialogDescription, default as dialogDescription } from './description.proto';
export { asDialogClose, default as dialogClose } from './close.proto';

export default dialogRoot;
