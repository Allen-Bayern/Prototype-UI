import type { BorrowedStateHandle, ExposeMethod, ExposeState, State } from '@proto.ui/core';
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
  click: import('@proto.ui/core').ExposeEvent<void>;
};

export type DialogTriggerAsHookContract = {
  event: {
    click: void;
  };
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
};

export type DialogMaskHandles = {
  stateHandles: {
    open: BorrowedStateHandle<boolean, DialogMaskProps>;
  };
  asTransition: TransitionHandles;
};

export type DialogContentProps = TransitionProps & {
  alert?: boolean;
};

export type DialogContentExposes = TransitionExposes & {
  open: ExposeState<boolean>;
};

export type DialogContentStateHandles = {
  open: State<boolean>;
};

export type DialogContentAsHookContract = {
  state: DialogContentStateHandles;
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
  click: import('@proto.ui/core').ExposeEvent<void>;
};

export type DialogCloseAsHookContract = {
  event: {
    click: void;
  };
};
