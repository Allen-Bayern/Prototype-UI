import type { PropsBaseType } from '@proto.ui/types';
import type { ViewIntentSnapshot } from '@proto.ui/runtime';
import { createHostWiring } from '../wiring/host-wiring';
import type { AdapterHostSession } from './adapter-host';
import type { WiringSpec } from '../types';

type ViewDisposer = () => void;

export type ViewEpochOwner<P extends PropsBaseType> = {
  readonly session: AdapterHostSession<P> | null;
  readonly hasView: boolean;
  readonly viewIntent: ViewIntentSnapshot | null;

  /**
   * Creates the Proto session while it is detached. The supplied wiring must
   * contain owner/instance capabilities only; view capabilities arrive later.
   */
  initialize(args: {
    modules: WiringSpec;
    createSession(wiring: ReturnType<typeof createHostWiring>): AdapterHostSession<P>;
    onViewIntent?(snapshot: ViewIntentSnapshot): void;
  }): AdapterHostSession<P>;

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
  let viewIntent: ViewIntentSnapshot | null = null;
  let unsubscribeIntent: (() => void) | null = null;
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
    get viewIntent() {
      return viewIntent;
    },
    initialize(input) {
      if (disposed) {
        throw new Error(`[AdapterHost] cannot initialize disposed ${args.prototypeName}`);
      }
      if (session || wiring) {
        throw new Error(`[AdapterHost] ${args.prototypeName} owner is already initialized`);
      }

      wiring = createHostWiring({ prototypeName: args.prototypeName, modules: input.modules });
      session = input.createSession(wiring);

      const notify = (snapshot: ViewIntentSnapshot) => {
        viewIntent = snapshot;
        input.onViewIntent?.(snapshot);
      };
      unsubscribeIntent = session.viewIntent.subscribe(notify);
      notify(session.viewIntent.getSnapshot());
      return session;
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
        viewIntent = session.viewIntent.getSnapshot();
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
      unsubscribeIntent?.();
      unsubscribeIntent = null;
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
