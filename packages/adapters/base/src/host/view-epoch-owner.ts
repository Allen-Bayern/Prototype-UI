import type { PropsBaseType } from '@proto.ui/types';
import { createHostWiring } from '../wiring/host-wiring';
import type { AdapterHostSession } from './adapter-host';
import type { WiringSpec } from '../types';

type ViewDisposer = () => void;

export type ViewEpochOwner<P extends PropsBaseType> = {
  readonly session: AdapterHostSession<P> | null;
  readonly hasView: boolean;

  attachView(args: {
    modules: WiringSpec;
    disposeView: ViewDisposer;
    createSession(wiring: ReturnType<typeof createHostWiring>): AdapterHostSession<P>;
  }): AdapterHostSession<P>;

  detachView(): Promise<void>;
  disposeView(): void;
  dispose(): Promise<void>;
};

/**
 * Owns one Proto instance and any number of replaceable host view epochs.
 *
 * Logical module caps remain attached while detached. A new view epoch
 * overwrites DOM-bound caps through HostWiring.rebind, then remounts the same
 * RuntimeSession. Terminal disposal remains a separate owner operation.
 */
export function createViewEpochOwner<P extends PropsBaseType>(args: {
  prototypeName: string;
}): ViewEpochOwner<P> {
  let wiring: ReturnType<typeof createHostWiring> | null = null;
  let session: AdapterHostSession<P> | null = null;
  let viewDisposer: ViewDisposer | null = null;
  let disposed = false;

  const disposeView = () => {
    const current = viewDisposer;
    viewDisposer = null;
    current?.();
  };

  return {
    get session() {
      return session;
    },
    get hasView() {
      return viewDisposer !== null;
    },
    attachView(input) {
      if (disposed) {
        throw new Error(`[AdapterHost] cannot attach a view to disposed ${args.prototypeName}`);
      }

      disposeView();
      viewDisposer = input.disposeView;

      if (!wiring) {
        wiring = createHostWiring({ prototypeName: args.prototypeName, modules: input.modules });
        session = input.createSession(wiring);
        return session;
      }

      wiring.rebind(input.modules);
      if (!session) {
        throw new Error(`[AdapterHost] missing session for ${args.prototypeName}`);
      }
      void session.mount();
      return session;
    },
    detachView() {
      const result = session?.unmount() ?? Promise.resolve();
      disposeView();
      return result;
    },
    disposeView,
    dispose() {
      if (disposed) return session?.dispose() ?? Promise.resolve();
      disposed = true;
      const result = session?.dispose() ?? Promise.resolve();
      disposeView();
      wiring = null;
      return result;
    },
  };
}

export function createDeferredOwnerDisposal(dispose: () => void | Promise<void>) {
  let version = 0;

  return {
    retain() {
      version += 1;
    },
    release() {
      const releaseVersion = ++version;
      queueMicrotask(() => {
        if (version !== releaseVersion) return;
        void dispose();
      });
    },
  };
}
