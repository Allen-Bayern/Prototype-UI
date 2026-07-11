import type { Prototype } from '@proto.ui/core';
import type {
  CommitSignal,
  RuntimeCheckpoint,
  RuntimeController,
  RuntimeLifecycleEvent,
} from '@proto.ui/runtime';
import {
  createDeferredOwnerDisposal,
  createEventGate,
  createSoftUnmountScheduler,
  createViewEpochOwner,
  createWebProtoEventRouter,
} from '@proto.ui/adapter-base';
import type { ExposeStateWebMode } from '@proto.ui/module-expose-state-web';
import {
  createZIndexOverlayLayerScheduler,
  type OverlayLayerScheduler,
  type OverlayZIndexLayerSchedulerOptions,
} from '@proto.ui/module-overlay';
import type { RawPropsSource } from '@proto.ui/module-props';
import { PropsBaseType } from '@proto.ui/types';

import { createDefaultMetaGetter } from './platform/meta';
import {
  bindLogicalParent,
  createLogicalInstance,
  markProtoInstance,
  unbindProtoInstance,
} from './platform/instance-tree';
import { createReactEffectsPort } from './runtime/effects-port';
import { createReactModules, createReactOwnerModules } from './runtime/modules';
import { createReactHostSession } from './runtime/session';
import { renderTemplateToReact, type ReactRuntime as ReactRenderRuntime } from './template';

export { __REACT_PROTO_INSTANCE } from './platform/instance-tree';

export type ReactRuntime = ReactRenderRuntime & {
  useState: <T>(init: T) => [T, (next: T) => void];
  useRef: <T>(init: T) => { current: T };
  useEffect: (cb: () => void | (() => void), deps?: any[]) => void;
  useLayoutEffect: (cb: () => void | (() => void), deps?: any[]) => void;
  useImperativeHandle: (ref: any, create: () => any, deps?: any[]) => void;
  forwardRef: (render: (props: any, ref: any) => any) => any;
  createElement: (type: any, props?: any, ...children: any[]) => any;
  createPortal?: (children: any, container: Element) => any;
  createContext?: <T>(defaultValue: T) => { Provider: any };
  useContext?: <T>(context: { Provider: any }) => T;
};

export type ReactAdapterHandle = {
  update(): void;
  getExposes(): Record<string, unknown>;
  invokeInCallbackScope?(fn: () => void): void;
};

export type ReactAdapterProps<Props extends PropsBaseType> = Props &
  PropsBaseType & {
    children?: any;
    className?: string;
    hostClassName?: string;
    style?: any;
    hostStyle?: any;
    [key: `on${string}`]: unknown;
  };

export interface ReactAdapterOptions<Props extends PropsBaseType> {
  schedule?: (task: () => void) => void;
  getProps?: (props: ReactAdapterProps<Props>) => Partial<Props> | null | undefined;
  getMeta?: (key: string) => unknown;
  diagnostics?: {
    onLifecycleEvent?: (event: RuntimeLifecycleEvent) => void;
    /** @deprecated Use onLifecycleEvent. */
    onLifecycleCheckpoint?: (cp: RuntimeCheckpoint) => void;
  };
  exposeStateWebMode?: ExposeStateWebMode;
  autoUpdateOnPropsChange?: boolean;
  rootTag?: string;
  overlayLayer?:
    | (OverlayZIndexLayerSchedulerOptions & {
        scheduler?: OverlayLayerScheduler;
      })
    | undefined;
}

type ReactRuntimeInput = ReactRuntime | { React: ReactRuntime };

function defaultGetProps<Props extends PropsBaseType>(
  props: ReactAdapterProps<Props>
): Partial<Props> {
  const { children, className, hostClassName, style, hostStyle, ...rest } = (props ?? {}) as any;
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (isFrameworkEventProp(key, value)) continue;
    filtered[key] = value;
  }
  return filtered as Partial<Props>;
}

export function createReactAdapter(runtimeInput: ReactRuntimeInput) {
  const runtime = normalizeRuntime(runtimeInput);
  const sharedOverlayLayerScheduler = createZIndexOverlayLayerScheduler();
  const logicalOwnerContext = runtime.createContext?.<ReturnType<
    typeof createLogicalInstance
  > | null>(null);

  return function AdaptToReact<Props extends PropsBaseType>(
    proto: Prototype<Props>,
    opt: ReactAdapterOptions<Props> = {}
  ) {
    const schedule = opt.schedule ?? ((task) => queueMicrotask(task));
    const getProps = opt.getProps ?? defaultGetProps;
    const getMeta = opt.getMeta ?? createDefaultMetaGetter();
    const exposeStateWebMode = opt.exposeStateWebMode;
    const autoUpdate = opt.autoUpdateOnPropsChange ?? true;
    const rootTag = opt.rootTag ?? 'div';
    const hasCustomOverlayLayerConfig =
      !!opt.overlayLayer &&
      (typeof opt.overlayLayer.baseZIndex !== 'undefined' ||
        typeof opt.overlayLayer.step !== 'undefined' ||
        typeof opt.overlayLayer.roleOffsets !== 'undefined');
    const overlayLayerScheduler =
      opt.overlayLayer?.scheduler ??
      (hasCustomOverlayLayerConfig
        ? createZIndexOverlayLayerScheduler({
            baseZIndex: opt.overlayLayer?.baseZIndex,
            step: opt.overlayLayer?.step,
            roleOffsets: opt.overlayLayer?.roleOffsets,
          })
        : sharedOverlayLayerScheduler);

    const Component = runtime.forwardRef((props: ReactAdapterProps<Props>, ref: any) => {
      const rootRef = runtime.useRef<HTMLElement | null>(null);
      const instanceTokenRef = runtime.useRef(createLogicalInstance(proto as Prototype<any>));
      const parentToken =
        logicalOwnerContext && runtime.useContext
          ? (runtime.useContext(logicalOwnerContext) as ReturnType<
              typeof createLogicalInstance
            > | null)
          : null;
      const supportsOwnerContext = !!logicalOwnerContext && !!runtime.useContext;
      if (logicalOwnerContext && runtime.useContext) {
        bindLogicalParent(instanceTokenRef.current, parentToken);
      }
      const [renderChildren, setRenderChildren] = runtime.useState<any>(null);
      const [hostTokens, setHostTokens] = runtime.useState<string[]>([]);
      const [shouldExist, setShouldExist] = runtime.useState(!supportsOwnerContext);

      const controllerRef = runtime.useRef<RuntimeController | null>(null);
      const eventGateRef = runtime.useRef<ReturnType<typeof createEventGate> | null>(null);
      const exposesRef = runtime.useRef<Record<string, unknown>>({});
      const invokeInCallbackScopeRef = runtime.useRef<((fn: () => void) => void) | null>(null);

      const propsRef = runtime.useRef<ReactAdapterProps<Props>>(props);
      propsRef.current = props;
      const eventCallbacksRef = runtime.useRef<Record<string, (payload?: unknown) => void>>({});
      eventCallbacksRef.current = collectEventCallbacks(props);

      const subsRef = runtime.useRef<Set<() => void>>(new Set());
      const rawPropsSourceRef = runtime.useRef<RawPropsSource<Props> | null>(null);

      const pendingCommitRef = runtime.useRef(false);
      const pendingSignalRef = runtime.useRef<CommitSignal | null>(null);
      const commitVersionRef = runtime.useRef(0);
      const [commitVersion, setCommitVersion] = runtime.useState(0);
      const hostSessionRef = runtime.useRef<ReturnType<
        typeof createReactHostSession<Props>
      > | null>(null);
      const ownerRef = runtime.useRef<ReturnType<typeof createViewEpochOwner<Props>> | null>(null);
      if (!ownerRef.current) {
        ownerRef.current = createViewEpochOwner<Props>({ prototypeName: proto.name });
      }
      const ownerDisposalRef = runtime.useRef<ReturnType<
        typeof createDeferredOwnerDisposal
      > | null>(null);
      if (!ownerDisposalRef.current) {
        ownerDisposalRef.current = createDeferredOwnerDisposal(() => ownerRef.current?.dispose());
      }
      const boundRootRef = runtime.useRef<HTMLElement | null>(null);
      const hasBeenUnmountedRef = runtime.useRef(false);
      const baselineOuterRafRef = runtime.useRef<number | null>(null);
      const baselineInnerRafRef = runtime.useRef<number | null>(null);
      const baselineSignalRef = runtime.useRef<CommitSignal | null>(null);

      const softUnmount = createSoftUnmountScheduler(
        () => rootRef.current,
        () => setShouldExist(false)
      );
      let legacyPresenceWritten = false;

      const presenceBridge = {
        mount() {
          legacyPresenceWritten = true;
          softUnmount.cancel();
          setShouldExist(true);
        },
        unmount(options?: { immediate?: boolean }) {
          legacyPresenceWritten = true;
          if (options?.immediate) {
            softUnmount.cancel();
            setShouldExist(false);
            return;
          }
          return softUnmount.schedule();
        },
      };

      const cancelBaselineFrames = () => {
        if (baselineOuterRafRef.current != null) {
          cancelAnimationFrame(baselineOuterRafRef.current);
          baselineOuterRafRef.current = null;
        }
        if (baselineInnerRafRef.current != null) {
          cancelAnimationFrame(baselineInnerRafRef.current);
          baselineInnerRafRef.current = null;
        }
      };

      const resolveBaselineSignal = () => {
        baselineSignalRef.current?.done?.();
        baselineSignalRef.current = null;
      };

      if (!rawPropsSourceRef.current) {
        rawPropsSourceRef.current = {
          debugName: `${proto.name}#raw-props`,
          get() {
            const nextProps = getProps(propsRef.current) ?? ({} as Partial<Props>);
            return nextProps as Readonly<Props & PropsBaseType>;
          },
          subscribe(cb) {
            subsRef.current.add(cb);
            return () => subsRef.current.delete(cb);
          },
        };
      }

      runtime.useImperativeHandle(
        ref,
        () => ({
          update: () => controllerRef.current?.update(),
          getExposes: () => ({ ...(exposesRef.current ?? {}) }),
          invokeInCallbackScope: (fn: () => void) => invokeInCallbackScopeRef.current?.(fn),
        }),
        []
      );

      runtime.useEffect(() => {
        for (const cb of subsRef.current) cb();
        if (autoUpdate) controllerRef.current?.update();
      }, [props, autoUpdate]);

      const createHostSession = (
        wiring: Parameters<typeof createReactHostSession<Props>>[0]['wiring'],
        initialMount: 'eager' | 'manual'
      ) =>
        createReactHostSession({
          proto,
          schedule,
          rawPropsSource: rawPropsSourceRef.current as RawPropsSource<Props>,
          wiring,
          eventGate: {
            disable: () => eventGateRef.current?.disable(),
            dispose: () => ownerRef.current?.disposeView(),
          },
          router: {
            dispose: () => ownerRef.current?.disposeView(),
          },
          onLifecycleCheckpoint: opt.diagnostics?.onLifecycleCheckpoint,
          onLifecycleEvent: opt.diagnostics?.onLifecycleEvent,
          onCommit: (children, signal) => {
            pendingCommitRef.current = true;
            pendingSignalRef.current = signal;
            setRenderChildren(children);
            commitVersionRef.current += 1;
            setCommitVersion(commitVersionRef.current);
          },
          onAfterUnmount: () => {
            hostSessionRef.current = null;
            controllerRef.current = null;
            exposesRef.current = {};
            setHostTokens([]);
          },
          initialMount,
        });

      runtime.useLayoutEffect(() => {
        if (!supportsOwnerContext) return;
        let hostSession = ownerRef.current?.session;
        if (!hostSession) {
          const ownerModules = createReactOwnerModules({
            instanceToken: instanceTokenRef.current,
            emit: (key, payload) => {
              eventCallbacksRef.current[key]?.(payload);
            },
            rawPropsSource: rawPropsSourceRef.current as RawPropsSource<Props>,
            getMeta,
            setExposes: (record) => {
              exposesRef.current = record;
            },
            runInCallbackScope: (fn) => {
              const invoke = invokeInCallbackScopeRef.current;
              if (invoke) invoke(fn);
              else fn();
            },
            presenceBridge,
            overlayLayerScheduler,
          });
          hostSession = ownerRef.current!.initialize({
            modules: ownerModules,
            createSession: (wiring) => createHostSession(wiring, 'manual'),
            onViewIntent: (snapshot) => {
              if (snapshot.version > 0 || !legacyPresenceWritten) {
                setShouldExist(snapshot.present);
              }
            },
          });
        }

        hostSessionRef.current = hostSession as ReturnType<typeof createReactHostSession<Props>>;
        controllerRef.current = hostSession.controller as RuntimeController;
        invokeInCallbackScopeRef.current = hostSession.invokeInCallbackScope;
        const initialIntent = hostSession.viewIntent.getSnapshot();
        if (initialIntent.version > 0 || !legacyPresenceWritten) {
          setShouldExist(initialIntent.present);
        }
      }, []);

      runtime.useLayoutEffect(() => {
        if (!shouldExist) {
          // Soft unmount: presence requested unmount, but adapter component remains in tree.
          // Disable events and clear visual host tokens, but keep exposes so imperative
          // methods (e.g. controls.enter) can still re-enter from closed/absent.
          softUnmount.cancel();
          cancelBaselineFrames();
          resolveBaselineSignal();
          if (ownerRef.current?.hasView) hasBeenUnmountedRef.current = true;
          eventGateRef.current?.disable?.();
          if (ownerRef.current?.hasView) void ownerRef.current.detachView();
          setHostTokens([]);
          return;
        }

        const rootEl = rootRef.current;
        if (!rootEl) return;

        markProtoInstance(rootEl, proto as Prototype<any>, instanceTokenRef.current);
        boundRootRef.current = rootEl;

        const eventGate = createEventGate();
        eventGateRef.current = eventGate;

        const router = createWebProtoEventRouter({
          rootEl,
          globalEl: typeof window === 'undefined' ? rootEl : window,
          isEnabled: () => eventGate.isEnabled?.() ?? true,
        });
        let viewDisposed = false;
        const disposeView = () => {
          if (viewDisposed) return;
          viewDisposed = true;
          eventGate.disable();
          eventGate.dispose();
          router.dispose();
          unbindProtoInstance(instanceTokenRef.current, boundRootRef.current ?? undefined);
          if (boundRootRef.current === rootEl) boundRootRef.current = null;
          if (eventGateRef.current === eventGate) eventGateRef.current = null;
        };

        const effectsPort = createReactEffectsPort((tokens) => {
          setHostTokens(tokens);
        });

        const rawPropsSource = rawPropsSourceRef.current as RawPropsSource<Props>;
        const modules = createReactModules({
          el: rootEl,
          instanceToken: instanceTokenRef.current,
          router,
          emit: (key, payload) => {
            eventCallbacksRef.current[key]?.(payload);
          },
          rawPropsSource,
          effectsPort,
          getMeta,
          exposeStateWebMode,
          setExposes: (record) => {
            exposesRef.current = record;
          },
          runInCallbackScope: (fn) => {
            const invoke = invokeInCallbackScopeRef.current;
            if (invoke) {
              invoke(fn);
              return;
            }
            fn();
          },
          presenceBridge,
          overlayLayerScheduler,
        });

        const hostSession = ownerRef.current!.attachView({
          modules,
          disposeView,
          createSession: (wiring) => createHostSession(wiring, 'eager'),
        });

        hostSessionRef.current = hostSession;
        controllerRef.current = hostSession.controller as RuntimeController;
        invokeInCallbackScopeRef.current = hostSession.invokeInCallbackScope;

        const { kernel } = hostSession;
        if (kernel && kernel.run) {
          (kernel.run as any).host = { get: () => rootRef.current };
        }
      }, [shouldExist]);

      // React StrictMode replays layout effects. Detach immediately so view
      // resources follow the replay, but defer terminal owner disposal by one
      // microtask so an immediate retain can preserve the Proto instance.
      runtime.useLayoutEffect(() => {
        ownerDisposalRef.current?.retain();
        return () => {
          softUnmount.cancel();
          cancelBaselineFrames();
          resolveBaselineSignal();
          void ownerRef.current?.detachView();
          ownerDisposalRef.current?.release();
        };
      }, []);

      runtime.useLayoutEffect(() => {
        if (!pendingCommitRef.current) return;
        pendingCommitRef.current = false;

        const rootEl = rootRef.current;
        const needsBaseline =
          rootEl && !eventGateRef.current?.isEnabled?.() && hasBeenUnmountedRef.current;

        if (needsBaseline) {
          // 为跨帧 CSS transition 做准备：真实卸载后的 remount 需要先以 closed 状态渲染一帧
          cancelBaselineFrames();
          resolveBaselineSignal();

          rootEl!.setAttribute('data-transition-state', 'closed');
          void rootEl!.offsetHeight;
          eventGateRef.current?.enable();

          const signal = pendingSignalRef.current;
          pendingSignalRef.current = null;

          baselineSignalRef.current = signal;

          // 关键：使用双 RAF，确保 closed baseline 至少经历一帧可见提交。
          baselineOuterRafRef.current = requestAnimationFrame(() => {
            baselineOuterRafRef.current = null;
            baselineInnerRafRef.current = requestAnimationFrame(() => {
              baselineInnerRafRef.current = null;
              hasBeenUnmountedRef.current = false;

              const latestRoot = rootRef.current;
              const realState = (
                exposesRef.current as { transitionState?: { get?(): string } } | undefined
              )?.transitionState?.get?.();
              if (latestRoot) {
                if (typeof realState === 'string') {
                  latestRoot.setAttribute('data-transition-state', realState);
                } else {
                  latestRoot.removeAttribute('data-transition-state');
                }
              }

              resolveBaselineSignal();
            });
          });
          return;
        }

        // Baseline is already running (double RAF not settled yet).
        // Keep forcing closed state and do not cancel queued baseline frames,
        // otherwise React follow-up commits can collapse closed -> entering.
        if (
          hasBeenUnmountedRef.current &&
          (baselineSignalRef.current != null ||
            baselineOuterRafRef.current != null ||
            baselineInnerRafRef.current != null)
        ) {
          rootEl?.setAttribute('data-transition-state', 'closed');
          eventGateRef.current?.enable();
          pendingSignalRef.current?.done?.();
          pendingSignalRef.current = null;
          return;
        }

        cancelBaselineFrames();
        resolveBaselineSignal();
        eventGateRef.current?.enable();
        pendingSignalRef.current?.done?.();
        pendingSignalRef.current = null;
      }, [commitVersion]);

      const rendered = renderTemplateToReact(runtime, renderChildren, {
        slot: props.children,
      });

      const content = !shouldExist
        ? null
        : runtime.createElement(
            rootTag,
            {
              ref: rootRef as { current: HTMLElement | null },
              className: mergeHostClassName([props.hostClassName, props.className]),
              style: mergeHostStyle([props.hostStyle, props.style]),
              'data-pui-root': '',
              'data-pui-style': serializeStyleTokens(hostTokens),
              'data-demo-ref': props['data-demo-ref' as keyof typeof props] as string | undefined,
            },
            rendered
          );
      if (!logicalOwnerContext) return content;
      return runtime.createElement(
        logicalOwnerContext.Provider,
        { value: instanceTokenRef.current },
        content
      );
    });

    Component.displayName = `Proto(${proto.name})`;
    return Component;
  };
}

function normalizeRuntime(input: ReactRuntimeInput): ReactRuntime {
  return (input as any).React ?? (input as ReactRuntime);
}

function mergeHostClassName(input: unknown) {
  const values = (Array.isArray(input) ? input : [input])
    .map((value: any) => (typeof value === 'string' ? value.trim() : value))
    .filter((value: any) => {
      if (typeof value === 'string') return value.length > 0;
      return value != null;
    });

  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    if (typeof value !== 'string') continue;
    for (const token of value.split(/\s+/)) {
      if (!token || seen.has(token)) continue;
      seen.add(token);
      out.push(token);
    }
  }

  return out.length > 0 ? out.join(' ') : undefined;
}

function mergeHostStyle(input: unknown) {
  const values = (Array.isArray(input) ? input : [input])
    .flatMap((value) => {
      if (value == null || value === '') return [];
      return Array.isArray(value) ? value : [value];
    })
    .filter((value) => {
      if (value == null || value === '') return false;
      if (typeof value === 'object') return Object.keys(value as object).length > 0;
      return String(value).trim().length > 0;
    });

  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  return values;
}

function serializeStyleTokens(tokens: string[]) {
  return tokens.length > 0 ? tokens.join(' ') : undefined;
}

function collectEventCallbacks(
  props: Record<string, unknown>
): Record<string, (payload?: unknown) => void> {
  const out: Record<string, (payload?: unknown) => void> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!isFrameworkEventProp(key, value)) continue;
    const eventKey = fromHandlerPropName(key);
    if (!eventKey) continue;
    out[eventKey] = value as (payload?: unknown) => void;
  }
  return out;
}

function isFrameworkEventProp(key: string, value: unknown) {
  return /^on[A-Z]/.test(key) && typeof value === 'function';
}

function fromHandlerPropName(key: string) {
  const raw = key.slice(2);
  if (!raw) return null;
  return raw[0]!.toLowerCase() + raw.slice(1);
}
