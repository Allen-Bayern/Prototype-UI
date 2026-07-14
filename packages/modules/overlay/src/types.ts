import type {
  ModuleInstance,
  OverlayConfig,
  OverlayConfigPatch,
  OverlayModuleHandle,
  OverlayReason,
  OverlayRegistration,
} from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';

export type {
  OverlayGlobalMount,
  OverlayModal,
  OverlayLayerRequest,
  OverlayLayerScheduler,
} from './caps';

export type OverlayFacade = {
  getOverlay<P extends PropsBaseType = PropsBaseType>(): OverlayModuleHandle<P>;
};

export type OverlayPort = {
  configure(patch: OverlayConfigPatch): void;
  open(reason?: OverlayReason): void;
  close(reason?: OverlayReason): void;
  toggle(reason?: OverlayReason): void;
  isOpen(): boolean;
  getConfig(): OverlayConfig;
  getWarnings(): readonly string[];
  getLastReason(): OverlayReason | undefined;
  getRegistration(): OverlayRegistration;
  registerTrigger(target: unknown): void;
  registerAnchor(target: unknown): void;
  registerContent(target: unknown): void;
  setViewActive(active: boolean): void;
  reconcileViewResourcesAfterCallback(): void;
};

export type OverlayModule = ModuleInstance<OverlayFacade> & {
  name: 'overlay';
  scope: 'instance';
  port: OverlayPort;
};
