import type {
  BorrowedStateHandle,
  ExposeEvent,
  ExposeMethod,
  ExposeState,
  State,
} from '@proto.ui/core';
import type { DialogOpenFocusReason } from './shared';
import type { TransitionExposes, TransitionHandles, TransitionProps } from '../transition/types';

export interface DialogRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  alert?: boolean;
}

export type DialogRootExposes = {
  open: ExposeState<boolean>;
  openDialog: ExposeMethod<(reason?: string) => void>;
  close: ExposeMethod<(reason?: string) => void>;
  toggle: ExposeMethod<(reason?: string) => void>;
  openChange: ExposeEvent<{
    open: boolean;
    reason: string | null;
    focusReason: DialogOpenFocusReason | null;
  }>;
};

export type DialogRootStateHandles = {
  open: State<boolean>;
};

export type DialogRootAsHookContract = {
  state: DialogRootStateHandles;
};

export interface DialogTriggerProps {
  disabled?: boolean;
}

export type DialogTriggerExposes = {
  disabled: ExposeState<boolean>;
  hovered: ExposeState<boolean>;
  focused: ExposeState<boolean>;
  focusVisible: ExposeState<boolean>;
  pressed: ExposeState<boolean>;
  focusSelf: ExposeMethod<(options?: { reason?: 'programmatic' | 'keyboard' | 'pointer' }) => void>;
};

export type DialogTriggerAsHookContract = {
  state: DialogCommandStateHandles;
};

export type DialogCommandStateHandles = {
  disabled: State<boolean>;
  hovered: State<boolean>;
  focused: State<boolean>;
  focusVisible: State<boolean>;
  pressed: State<boolean>;
};

export type DialogMaskProps = TransitionProps & {
  passthrough?: boolean;
};

export type DialogMaskExposes = TransitionExposes;

export type DialogMaskStateHandles = {
  open: State<boolean>;
};

export type DialogMaskAsHookContract = {
  state: DialogMaskStateHandles;
  asHooks: {
    asTransition: TransitionHandles;
  };
};

export type DialogMaskHandles = {
  stateHandles: {
    open: BorrowedStateHandle<boolean, DialogMaskProps>;
  };
  asTransition: TransitionHandles;
};

export type DialogContentProps = TransitionProps;

export type DialogContentExposes = TransitionExposes & {
  open: ExposeState<boolean>;
};

export type DialogContentStateHandles = {
  open: State<boolean>;
};

export type DialogContentAsHookContract = {
  state: DialogContentStateHandles;
  asHooks: {
    asTransition: TransitionHandles;
  };
};

export type DialogContentHandles = {
  stateHandles: {
    open: BorrowedStateHandle<boolean, DialogContentProps>;
  };
  asTransition: TransitionHandles;
};

export interface DialogTitleProps {}

export type DialogTitleExposes = {};

export type DialogTitleAsHookContract = {};

export interface DialogDescriptionProps {}

export type DialogDescriptionExposes = {};

export type DialogDescriptionAsHookContract = {};

export interface DialogCloseProps {
  disabled?: boolean;
}

export type DialogCloseExposes = {
  disabled: ExposeState<boolean>;
  hovered: ExposeState<boolean>;
  focused: ExposeState<boolean>;
  focusVisible: ExposeState<boolean>;
  pressed: ExposeState<boolean>;
  focusSelf: ExposeMethod<(options?: { reason?: 'programmatic' | 'keyboard' | 'pointer' }) => void>;
};

export type DialogCloseAsHookContract = {
  state: DialogCommandStateHandles;
};
