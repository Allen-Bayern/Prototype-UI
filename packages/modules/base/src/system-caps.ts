import { cap, type InstancePhase, type MountPhase, type ProtoPhase } from '@proto.ui/core';

export type ExecPhase = 'setup' | 'render' | 'callback' | 'unknown';
export type GuardDomain = 'setup' | 'runtime';

export interface SystemCaps {
  /** exec-phase (more precise than domain) */
  execPhase(): ExecPhase;

  /** derived: setup vs runtime (kept for compatibility) */
  domain(): GuardDomain;

  /** proto lifecycle phase */
  /** @deprecated Use instancePhase and mountPhase. */
  protoPhase(): ProtoPhase;

  /** Current terminal instance lifecycle phase. */
  instancePhase?(): InstancePhase;

  /** Current repeatable host-view lifecycle phase. */
  mountPhase?(): MountPhase;

  /** disposal state */
  isDisposed(): boolean;

  // --- guards ---
  ensureNotDisposed(op: string): void;
  ensureExecPhase(op: string, expected: ExecPhase | ExecPhase[]): void;

  /** convenience */
  ensureSetup(op: string): void;
  ensureRuntime(op: string): void;

  /**
   * callback-only: recommended for "runtime mutation" APIs (state.set etc.)
   * This prevents render-phase mutations.
   */
  ensureCallback(op: string): void;

  /**
   * Runtime callback context (opaque).
   *
   * - In engine-driven execution, this will typically be `run`.
   * - Outside callback phase, it should return `undefined`.
   * - State/event modules MUST treat it as unknown and not depend on its shape.
   */
  getCallbackCtx(): unknown;

  /**
   * Queue work until the outermost runtime callback chain has completed.
   * Module implementations may use this to avoid mutating host resources in
   * the middle of lifecycle/event/state callback delivery.
   */
  deferAfterCallback?(task: () => void): void;
}

export const SYS_CAP = cap<SystemCaps>('@proto.ui/__sys');
