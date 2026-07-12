import { delay, type RunHandle } from '@proto.ui/core';
import { definePrivilegedAsHook } from './privileged';
import { createTransitionMachine, type TransitionMachineDriver } from './transition-machine';
import type {
  TransitionHandles,
  TransitionInterrupt,
  TransitionProps,
  TransitionState,
} from './as-transition-types';

const installTransition = definePrivilegedAsHook<TransitionProps, TransitionHandles>({
  name: 'asTransition',
  setup: ({ def }) => {
    def.props.define({
      open: { type: 'boolean', empty: 'fallback' },
      defaultOpen: { type: 'boolean', empty: 'fallback' },
      appear: { type: 'boolean', empty: 'fallback' },
      enterDuration: { type: 'number', empty: 'fallback' },
      leaveDuration: { type: 'number', empty: 'fallback' },
      interrupt: {
        type: 'enum',
        empty: 'fallback',
        options: ['reverse', 'wait', 'immediate'],
      },
    });
    def.props.setDefaults({
      defaultOpen: false,
      appear: false,
      enterDuration: 300,
      leaveDuration: 200,
      interrupt: 'reverse',
    });

    def.expose.event('beforeEnter', { payload: 'void' });
    def.expose.event('afterEnter', { payload: 'void' });
    def.expose.event('beforeLeave', { payload: 'void' });
    def.expose.event('afterLeave', { payload: 'void' });

    const transitionState = def.state.enum<['closed', 'entering', 'entered', 'leaving']>(
      'transitionState',
      'closed',
      { options: ['closed', 'entering', 'entered', 'leaving'] }
    );
    const isPresent = def.state.bool('isPresent', false);

    let currentRun: RunHandle<TransitionProps> | null = null;
    let interrupt: TransitionInterrupt = 'reverse';
    let enterDuration = 300;
    let leaveDuration = 200;

    const refreshConfig = (run: RunHandle<TransitionProps>) => {
      const props = run.props.get();
      interrupt = (props.interrupt as TransitionInterrupt | undefined) ?? 'reverse';
      enterDuration = props.enterDuration ?? 300;
      leaveDuration = props.leaveDuration ?? 200;
    };

    const driver: TransitionMachineDriver = {
      getState: () => transitionState.get(),
      setState(state: TransitionState) {
        transitionState.set(state, `reason: asTransition => ${state}`);
        isPresent.set(state !== 'closed', `reason: asTransition presence => ${state}`);
      },
      getInterrupt: () => interrupt,
      getDuration: (state) => (state === 'entering' ? enterDuration : leaveDuration),
      schedule: (durationMs, callback) => delay(durationMs, callback),
      setViewPresent(present) {
        if (!currentRun) {
          throw new Error('[asTransition] runtime lifecycle handle is not available.');
        }
        currentRun.lifecycle.setPresent(present);
      },
      emit(event) {
        if (!currentRun) return;
        currentRun.expose.emit(event);
      },
    };
    const machine = createTransitionMachine(driver);

    const controls = {
      enter: () => machine.enter(),
      leave: () => machine.leave(),
      complete: () => machine.complete(),
    };

    def.lifecycle.onCreated((run) => {
      currentRun = run;
      refreshConfig(run);
      const props = run.props.get();
      const controlled = run.props.isProvided('open');
      const open = controlled ? !!props.open : !!props.defaultOpen;
      machine.initialize(open, !!props.appear);
    });

    def.lifecycle.onMounted((run) => {
      currentRun = run;
      refreshConfig(run);
      machine.mounted();
    });

    def.lifecycle.onUnmounted((run) => {
      currentRun = run;
      machine.unmounted();
    });

    def.lifecycle.onBeforeDispose(() => {
      machine.dispose();
      currentRun = null;
    });

    def.props.watch(['open', 'interrupt', 'enterDuration', 'leaveDuration'], (run, next) => {
      currentRun = run;
      refreshConfig(run);
      if (!run.props.isProvided('open')) return;
      machine.setTarget(!!next.open);
    });

    def.expose.state('transitionState', transitionState);
    def.expose.state('isPresent', isPresent);
    def.expose.method('enter', controls.enter);
    def.expose.method('leave', controls.leave);
    def.expose.method('complete', controls.complete);
    def.expose.value('controls', controls);

    return { transitionState, isPresent, controls };
  },
});

/**
 * Installs perceptual transition governance once per prototype setup chain.
 * Repeated calls return the exact same handle object.
 */
export function asTransition(): TransitionHandles {
  return installTransition();
}
