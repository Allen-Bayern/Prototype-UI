import { ExposeEvent, ExposeMethod, ExposeState, State } from '@proto.ui/core';
import type {
  ToggleAsHookContract,
  ToggleExposes,
  ToggleProps,
  ToggleStateHandles,
} from '../toggle/types';

export type CheckboxCheckedChangeDetail = {
  checked: boolean;
  indeterminate: boolean;
};

export interface CheckboxRootProps extends ToggleProps {
  indeterminate?: boolean;
  defaultIndeterminate?: boolean;
}

export type CheckboxRootExposes = Omit<ToggleExposes, 'checkedChange'> & {
  indeterminate: ExposeState<boolean>;
  checkedChange: ExposeEvent<CheckboxCheckedChangeDetail>;
  indeterminateChange: ExposeEvent<{ indeterminate: boolean }>;
};

export type CheckboxRootStateHandles = ToggleStateHandles & {
  indeterminate: State<boolean>;
};

export type CheckboxRootAsHookContract = Omit<ToggleAsHookContract, 'event'> & {
  state: ToggleStateHandles & { indeterminate: State<boolean> };
  event: {
    checkedChange: CheckboxCheckedChangeDetail;
    indeterminateChange: { indeterminate: boolean };
  };
};

export interface CheckboxIndicatorProps {}

export type CheckboxIndicatorExposes = {
  checked: ExposeState<boolean>;
  indeterminate: ExposeState<boolean>;
  isChecked: ExposeMethod<() => boolean | null>;
  isIndeterminate: ExposeMethod<() => boolean | null>;
};

export type CheckboxIndicatorStateHandles = {
  checked: State<boolean>;
  indeterminate: State<boolean>;
};

export type CheckboxIndicatorAsHookContract = {
  state: CheckboxIndicatorStateHandles;
};
