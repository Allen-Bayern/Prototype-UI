import type {
  BorrowedStateHandle,
  ExposeEvent,
  ExposeMethod,
  ExposeState,
  ExposeValue,
  State,
} from '@proto.ui/core';

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

export type TransitionConfig = {
  appear?: boolean;
  enterDuration?: number;
  leaveDuration?: number;
  interrupt?: TransitionInterrupt;
};

export type TransitionExposes = {
  beforeEnter: ExposeEvent<void>;
  afterEnter: ExposeEvent<void>;
  beforeLeave: ExposeEvent<void>;
  afterLeave: ExposeEvent<void>;
  transitionState: ExposeState<TransitionState>;
  /** Perceptual presence. Structural view presence remains owned by lifecycle ViewIntent. */
  isPresent: ExposeState<boolean>;
  enter: ExposeMethod<() => void>;
  leave: ExposeMethod<() => void>;
  complete: ExposeMethod<() => void>;
  controls: ExposeValue<TransitionControls>;
};

export type TransitionHandles = {
  transitionState: BorrowedStateHandle<TransitionState, TransitionProps>;
  /** Perceptual presence. This must not be used as a second mount-phase fact. */
  isPresent: BorrowedStateHandle<boolean, TransitionProps>;
  controls: TransitionControls;
  /** Sets setup-time defaults. Explicit host props take precedence at runtime. */
  configure(config: TransitionConfig): void;
};

export type TransitionAsHookContract = {
  state: {
    transitionState: State<TransitionState>;
    isPresent: State<boolean>;
    transitionAppearDefault: State<boolean>;
    transitionEnterDurationDefault: State<number>;
    transitionLeaveDurationDefault: State<number>;
    transitionInterruptDefault: State<TransitionInterrupt>;
  };
};
