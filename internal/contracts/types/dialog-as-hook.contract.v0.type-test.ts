import {
  asDialogContent,
  type DialogContentExposes,
  type DialogContentProps,
} from '@proto.ui/prototypes-base';
import type {
  ShadcnDialogContentExposes,
  ShadcnDialogContentProps,
  ShadcnDialogRootProps,
} from '@proto.ui/prototypes-shadcn';

declare const baseProps: DialogContentProps;
declare const baseExposes: DialogContentExposes;
declare const shadcnProps: ShadcnDialogContentProps;
declare const shadcnExposes: ShadcnDialogContentExposes;
declare const shadcnRootProps: ShadcnDialogRootProps;

// Base asHook types reflect capabilities injected by the nested Transition.
baseProps.enterDuration;
baseProps.leaveDuration;
baseExposes.controls;

const dialog = asDialogContent();
dialog.stateHandles.open.get();
dialog.asTransition.configure({ enterDuration: 200, leaveDuration: 200 });
dialog.asTransition.controls.complete();

// Nested state handles stay nested instead of being flattened onto Dialog.
// @ts-expect-error access Transition state through dialog.asTransition
dialog.stateHandles.transitionState;

// A design-language library maintains a narrower translated public API.
shadcnRootProps.alert;
shadcnExposes.open;
// @ts-expect-error alert mode is owned by Dialog Root rather than Content
shadcnProps.alert;
// @ts-expect-error Shadcn motion policy is internal rather than a public prop
shadcnProps.enterDuration;
// @ts-expect-error Shadcn does not publish Transition controls in its final expose type
shadcnExposes.controls;
