export type PresencePhase = 'absent' | 'mounting' | 'present' | 'unmounting';

export interface PresencePolicy {
  mode?: 'transition' | 'immediate';
}

export interface PresenceHandle {
  setIntent(intent: 'enter' | 'leave'): void | Promise<void>;
  getPhase(): PresencePhase;
  onBeforeMount(cb: () => void | Promise<void>): () => void;
  onBeforeUnmount(cb: () => void | Promise<void>): () => void;
}

export interface PresenceFacade {
  createHandle(policy?: PresencePolicy): PresenceHandle;
}

export interface PresencePort {
  awaitMount(): Promise<void> | undefined;
  awaitUnmount(): Promise<void> | undefined;
  /** Terminal host teardown: notify the bridge but never block disposal. */
  forceUnmount(): void;
  setLifecycleDriver(driver: PresenceLifecycleDriver | null): void;
}

export interface PresenceLifecycleDriver {
  requestMount(): void;
  requestUnmount(): void;
}

export interface PresenceHostBridge {
  mount(): void | Promise<void>;
  unmount(options?: { immediate?: boolean }): void | Promise<void>;
}
