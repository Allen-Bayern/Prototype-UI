import type {
  ToggleAsHookContract,
  ToggleExposes,
  ToggleProps,
  ToggleStateHandles,
} from '@proto.ui/prototypes-base/toggle';

export interface ShadcnToggleProps extends ToggleProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export type ShadcnToggleExposes = ToggleExposes;

export type ShadcnToggleStateHandles = ToggleStateHandles;

export type ShadcnToggleAsHookContract = ToggleAsHookContract;
