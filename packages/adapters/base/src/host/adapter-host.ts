// packages/adapters/base/src/host/adapter-host.ts
import type { Prototype } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { executeWithHost, type RuntimeHost, type ExecuteWithHostResult } from '@proto.ui/runtime';
import { createTeardown } from '../lifecycle/teardown';

export type AdapterHostHooks<P extends PropsBaseType> = {
  onRuntimeReady?: RuntimeHost<P>['onRuntimeReady'];
  onUnmountBegin?: RuntimeHost<P>['onUnmountBegin'];
  afterUnmount?: () => void;
};

export type AdapterHostInput<P extends PropsBaseType> = Pick<
  RuntimeHost<P>,
  'commit' | 'schedule' | 'getRawProps' | 'onLifecycleCheckpoint' | 'onLifecycleEvent'
>;

export type AdapterHostSession<P extends PropsBaseType> = {
  controller: ExecuteWithHostResult['controller'];
  mount(): Promise<void>;
  unmount(): Promise<void>;
  dispose(): Promise<void>;
  caps: ExecuteWithHostResult['caps'];
  invokeInCallbackScope: ExecuteWithHostResult['invokeInCallbackScope'];
  kernel: ExecuteWithHostResult['kernel'];
};

export function createAdapterHost<P extends PropsBaseType>(
  proto: Prototype<P>,
  host: AdapterHostInput<P>,
  hooks: AdapterHostHooks<P> = {}
): AdapterHostSession<P> {
  const teardown = createTeardown();
  let disposePromise: Promise<void> | null = null;
  let afterUnmountDone = false;

  const finishAfterUnmount = () => {
    if (afterUnmountDone) return;
    afterUnmountDone = true;
    hooks.afterUnmount?.();
  };

  const res = executeWithHost(proto, {
    prototypeName: proto.name,
    getRawProps: host.getRawProps,
    commit: host.commit,
    schedule: host.schedule,
    onLifecycleCheckpoint: host.onLifecycleCheckpoint,
    onLifecycleEvent: host.onLifecycleEvent,
    onRuntimeReady: hooks.onRuntimeReady,
    onUnmountBegin: hooks.onUnmountBegin,
  });

  return {
    controller: res.controller,
    caps: res.caps,
    invokeInCallbackScope: res.invokeInCallbackScope,
    kernel: res.kernel,
    mount: () => res.session.mount(),
    unmount: () => res.session.unmount(),
    dispose() {
      teardown.run(() => {
        const runtimeDispose = Promise.resolve(res.invokeUnmounted());

        // RuntimeSession deliberately completes the terminal transition
        // synchronously when no async presence transition is pending. Keep
        // adapter resource disposal in that same turn so DOM listeners do not
        // outlive their host/test environment by an extra microtask.
        if (res.session.instancePhase === 'disposed') {
          let afterUnmountError: unknown;
          try {
            finishAfterUnmount();
          } catch (error) {
            afterUnmountError = error;
          }
          disposePromise = runtimeDispose.then(() => {
            if (afterUnmountError) throw afterUnmountError;
          });
          return;
        }

        disposePromise = runtimeDispose.finally(finishAfterUnmount);
      });
      return disposePromise ?? Promise.resolve();
    },
  };
}
