import type { ExposeMethod, ExposeState, ExposeValue, State } from '@proto.ui/core';

export type TransitionState = 'closed' | 'entering' | 'entered' | 'leaving';
export type TransitionInterrupt = 'reverse' | 'wait' | 'immediate';

export type TransitionProps = {
  open?: boolean;
  defaultOpen?: boolean;
  appear?: boolean;
  enterDuration?: number;
  leaveDuration?: number;
  interrupt?: TransitionInterrupt;
};

export type TransitionControls = {
  enter(): void;
  leave(): void;
  complete(): void;
};

export type TransitionExposes = {
  transitionState: ExposeState<TransitionState>;
  /** Perceptual presence. Structural view presence remains owned by lifecycle ViewIntent. */
  isPresent: ExposeState<boolean>;
  enter: ExposeMethod<() => void>;
  leave: ExposeMethod<() => void>;
  complete: ExposeMethod<() => void>;
  controls: ExposeValue<TransitionControls>;
};

export type TransitionHandles = {
  transitionState: State<TransitionState>;
  /** Perceptual presence. This must not be used as a second mount-phase fact. */
  isPresent: State<boolean>;
  controls: TransitionControls;
};

export type TransitionAsHookContract = {
  state: TransitionHandles;
};
