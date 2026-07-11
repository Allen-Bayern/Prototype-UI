import { ExposeEvent, ExposeMethod, ExposeState, FocusRequestOptions, State } from '@proto.ui/core';
import type { TabsActivationMode, TabsOrientation } from './shared';

export interface TabsRootProps {
  value?: string;
  defaultValue?: string;
  orientation?: TabsOrientation;
  activationMode?: TabsActivationMode;
}

export type TabsRootExposes = {
  value: ExposeState<string>;
  valueChange: ExposeEvent<{ value: string }>;
};

export type TabsRootStateHandles = {
  value: State<string>;
};

export type TabsRootAsHookContract = {
  state: TabsRootStateHandles;
  event: {
    valueChange: { value: string };
  };
};

export interface TabsListProps {
  orientation?: TabsOrientation;
  loop?: boolean;
  a11yLabel?: string;
}

export type TabsListExposes = {
  focusFirst: ExposeMethod<() => void>;
  focusLast: ExposeMethod<() => void>;
  focusNext: ExposeMethod<() => void>;
  focusPrev: ExposeMethod<() => void>;
};
export type TabsListAsHookContract = {};

export interface TabsTriggerProps {
  value?: string;
  disabled?: boolean;
}

export type TabsTriggerExposes = {
  disabled: ExposeState<boolean>;
  hovered: ExposeState<boolean>;
  focused: ExposeState<boolean>;
  focusVisible: ExposeState<boolean>;
  pressed: ExposeState<boolean>;
  selected: ExposeState<boolean>;
  focusSelf: ExposeMethod<(options?: FocusRequestOptions) => void>;
  click: ExposeEvent<void>;
};

export type TabsTriggerStateHandles = {
  disabled: State<boolean>;
  hovered: State<boolean>;
  focused: State<boolean>;
  focusVisible: State<boolean>;
  pressed: State<boolean>;
  selected: State<boolean>;
};

export type TabsTriggerAsHookContract = {
  state: TabsTriggerStateHandles;
  event: {
    click: void;
  };
};

export interface TabsContentProps {
  value?: string;
  /** Retain the complete host view while this panel is inactive. Defaults to false. */
  keepMounted?: boolean;
}

export type TabsContentExposes = {
  current: ExposeState<boolean>;
  hidden: ExposeState<boolean>;
};

export type TabsContentStateHandles = {
  current: State<boolean>;
  hidden: State<boolean>;
};

export type TabsContentAsHookContract = {
  state: TabsContentStateHandles;
};

export interface TabsIndicatorProps {}

export type TabsIndicatorExposes = {
  value: ExposeState<string>;
  activeValue: ExposeState<string>;
  orientation: ExposeState<string>;
};

export type TabsIndicatorStateHandles = {
  value: State<string>;
  activeValue: State<string>;
  orientation: State<string>;
};

export type TabsIndicatorAsHookContract = {
  state: TabsIndicatorStateHandles;
};
