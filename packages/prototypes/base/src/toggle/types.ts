import { ExposeEvent, ExposeMethod, ExposeState, FocusRequestOptions, State } from '@proto.ui/core';

export interface ToggleProps {
  active?: boolean;
  defaultActive?: boolean;
  disabled?: boolean;
}

export type ToggleExposes = {
  disabled: ExposeState<boolean>;
  hovered: ExposeState<boolean>;
  focused: ExposeState<boolean>;
  focusVisible: ExposeState<boolean>;
  pressed: ExposeState<boolean>;
  active: ExposeState<boolean>;
  focusSelf: ExposeMethod<(options?: FocusRequestOptions) => void>;
  activeChange: ExposeEvent<{ active: boolean }>;
};

export type ToggleStateHandles = {
  disabled: State<boolean>;
  hovered: State<boolean>;
  focused: State<boolean>;
  focusVisible: State<boolean>;
  pressed: State<boolean>;
  active: State<boolean>;
};

export type ToggleAsHookContract = {
  state: ToggleStateHandles;
  event: {
    activeChange: { active: boolean };
  };
};
