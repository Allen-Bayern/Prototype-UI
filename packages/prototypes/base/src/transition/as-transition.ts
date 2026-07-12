import { defineAsHook, delay, type RunHandle } from '@proto.ui/core';
import { createTransitionMachine, type TransitionMachineDriver } from './machine';
import type {
  TransitionAsHookContract,
  TransitionControls,
  TransitionExposes,
  TransitionHandles,
  TransitionInterrupt,
  TransitionProps,
  TransitionState,
} from './types';

function requireProjectedHandle<T>(value: T | undefined, name: string): T {
  if (typeof value === 'undefined') {
    throw new Error(`[asTransition] missing captured handle: ${name}.`);
  }
  return value;
}

/**
 * Installs perceptual transition governance once per prototype setup chain.
 * Repeated calls return the exact same projected handle object.
 */
export const asTransition = defineAsHook<
  TransitionProps,
  TransitionExposes,
  TransitionAsHookContract,
  TransitionHandles
>({
  name: 'asTransition',
  setup(def) {
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
    const getProps = () => currentRun?.props.get();

    const driver: TransitionMachineDriver = {
      getState: () => transitionState.get(),
      setState(state: TransitionState) {
        transitionState.set(state, `reason: asTransition => ${state}`);
        isPresent.set(state !== 'closed', `reason: asTransition presence => ${state}`);
      },
      getInterrupt: () => (getProps()?.interrupt as TransitionInterrupt | undefined) ?? 'reverse',
      getDuration: (state) =>
        state === 'entering'
          ? (getProps()?.enterDuration ?? 300)
          : (getProps()?.leaveDuration ?? 200),
      schedule: (durationMs, callback) => delay(durationMs, callback),
      setViewPresent(present) {
        if (!currentRun) {
          throw new Error('[asTransition] runtime lifecycle handle is not available.');
        }
        currentRun.lifecycle.setPresent(present);
      },
      emit(event) {
        currentRun?.expose.emit(event);
      },
    };
    const machine = createTransitionMachine(driver);

    const controls: TransitionControls = {
      enter: () => machine.enter(),
      leave: () => machine.leave(),
      complete: () => machine.complete(),
    };

    def.lifecycle.onCreated((run) => {
      currentRun = run;
      const props = run.props.get();
      const controlled = run.props.isProvided('open');
      const open = controlled ? !!props.open : !!props.defaultOpen;
      machine.initialize(open, !!props.appear);
    });

    def.lifecycle.onMounted((run) => {
      currentRun = run;
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
      if (!run.props.isProvided('open')) return;
      machine.setTarget(!!next.open);
    });

    def.expose.state('transitionState', transitionState);
    def.expose.state('isPresent', isPresent);
    def.expose.method('enter', controls.enter);
    def.expose.method('leave', controls.leave);
    def.expose.method('complete', controls.complete);
    def.expose.value('controls', controls);
  },
  projectHandle(result) {
    const transitionState = requireProjectedHandle(
      result.getState?.('transitionState'),
      'transitionState'
    );
    const isPresent = requireProjectedHandle(result.getState?.('isPresent'), 'isPresent');
    const controls: TransitionControls = {
      enter: requireProjectedHandle(
        result.getMethod?.('enter') as (() => void) | undefined,
        'enter'
      ),
      leave: requireProjectedHandle(
        result.getMethod?.('leave') as (() => void) | undefined,
        'leave'
      ),
      complete: requireProjectedHandle(
        result.getMethod?.('complete') as (() => void) | undefined,
        'complete'
      ),
    };

    return { transitionState, isPresent, controls };
  },
});
