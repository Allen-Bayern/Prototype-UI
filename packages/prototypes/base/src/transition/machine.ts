import type { DelayTask } from '@proto.ui/core';
import type { TransitionInterrupt, TransitionState } from './types';

type TransitionIntent = 'enter' | 'leave';
type TransitionEvent = 'beforeEnter' | 'afterEnter' | 'beforeLeave' | 'afterLeave';

export type TransitionMachineDriver = {
  getState(): TransitionState;
  setState(state: TransitionState): void;
  getInterrupt(): TransitionInterrupt;
  getDuration(state: 'entering' | 'leaving'): number;
  schedule(durationMs: number, callback: () => void): DelayTask;
  setViewPresent(present: boolean): void;
  emit(event: TransitionEvent): void;
};

export type TransitionMachine = {
  initialize(open: boolean, appear: boolean): void;
  setTarget(open: boolean): void;
  enter(): void;
  leave(): void;
  complete(): void;
  mounted(): void;
  unmounted(): void;
  dispose(): void;
};

export function createTransitionMachine(driver: TransitionMachineDriver): TransitionMachine {
  let targetOpen = false;
  let viewMounted = false;
  let queuedIntent: TransitionIntent | null = null;
  let pendingTask: DelayTask | null = null;
  let generation = 0;

  const invalidateCompletion = () => {
    generation += 1;
    pendingTask?.cancel();
    pendingTask = null;
  };

  const setState = (state: TransitionState) => {
    driver.setState(state);
  };

  const armCompletion = (state: 'entering' | 'leaving') => {
    invalidateCompletion();
    const activeGeneration = generation;
    pendingTask = driver.schedule(driver.getDuration(state), () => {
      if (activeGeneration !== generation || driver.getState() !== state) return;
      pendingTask = null;
      completeCurrent(true);
    });
  };

  const beginEnter = () => {
    driver.setViewPresent(true);
    if (!viewMounted) return;
    queuedIntent = null;
    driver.emit('beforeEnter');
    setState('entering');
    armCompletion('entering');
  };

  const beginLeave = () => {
    queuedIntent = null;
    driver.emit('beforeLeave');
    setState('leaving');
    armCompletion('leaving');
  };

  const consumeQueuedIntent = () => {
    const next = queuedIntent;
    queuedIntent = null;
    if (next === 'enter') enter();
    else if (next === 'leave') leave();
  };

  const completeCurrent = (consumeQueue: boolean) => {
    const current = driver.getState();
    if (current !== 'entering' && current !== 'leaving') return;
    invalidateCompletion();

    if (current === 'entering') {
      setState('entered');
      driver.emit('afterEnter');
    } else {
      setState('closed');
      driver.emit('afterLeave');
      driver.setViewPresent(false);
    }

    if (consumeQueue) consumeQueuedIntent();
  };

  const enter = () => {
    targetOpen = true;
    const current = driver.getState();
    if (current === 'entered') return;

    if (current === 'closed') {
      beginEnter();
      return;
    }

    if (current === 'entering') {
      if (driver.getInterrupt() === 'wait') queuedIntent = null;
      return;
    }

    const interrupt = driver.getInterrupt();
    if (interrupt === 'wait') {
      queuedIntent = 'enter';
    } else if (interrupt === 'immediate') {
      completeCurrent(false);
      beginEnter();
    } else {
      invalidateCompletion();
      beginEnter();
    }
  };

  const leave = () => {
    targetOpen = false;
    const current = driver.getState();
    if (current === 'closed') {
      driver.setViewPresent(false);
      return;
    }

    if (current === 'leaving') {
      if (driver.getInterrupt() === 'wait') queuedIntent = null;
      return;
    }

    if (current === 'entered') {
      beginLeave();
      return;
    }

    const interrupt = driver.getInterrupt();
    if (interrupt === 'wait') {
      queuedIntent = 'leave';
    } else if (interrupt === 'immediate') {
      completeCurrent(false);
      beginLeave();
    } else {
      invalidateCompletion();
      beginLeave();
    }
  };

  const initialize = (open: boolean, appear: boolean) => {
    targetOpen = open;
    queuedIntent = null;
    invalidateCompletion();

    if (!open) {
      setState('closed');
      driver.setViewPresent(false);
      return;
    }

    driver.setViewPresent(true);
    if (!appear) setState('entered');
  };

  const mounted = () => {
    viewMounted = true;
    if (targetOpen && driver.getState() === 'closed') beginEnter();
  };

  const unmounted = () => {
    viewMounted = false;
    invalidateCompletion();
    queuedIntent = null;
    if (driver.getState() !== 'closed') setState('closed');
  };

  const dispose = () => {
    viewMounted = false;
    queuedIntent = null;
    invalidateCompletion();
  };

  return {
    initialize,
    setTarget(open) {
      if (open === targetOpen) return;
      if (open) enter();
      else leave();
    },
    enter,
    leave,
    complete: () => completeCurrent(true),
    mounted,
    unmounted,
    dispose,
  };
}
