import type {
  FocusFacts,
  FocusRovingConfig,
  FocusRovingConfigPatch,
  FocusRovingHandle,
  FocusRovingKey,
  FocusScopeConfig,
  FocusRequestOptions,
  FocusScopeConfigPatch,
  FocusScopeHandle,
  FocusScopeKey,
  FocusableConfig,
  FocusableConfigPatch,
  FocusableHandle,
  ModuleInstance,
} from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';

export type FocusFacade = {
  getFocusable<P extends PropsBaseType = PropsBaseType>(): FocusableHandle<P>;
  getRoving<P extends PropsBaseType = PropsBaseType>(): FocusRovingHandle<P>;
  getScope<P extends PropsBaseType = PropsBaseType>(): FocusScopeHandle<P>;
};

export type FocusPort = {
  configureFocusable(patch: FocusableConfigPatch): void;
  configureRoving(patch: FocusRovingConfigPatch): void;
  configureGroup(patch: FocusRovingConfigPatch): void;
  configureScope(patch: FocusScopeConfigPatch): void;
  setDisabled(disabled: boolean): void;
  requestFocus(options?: FocusRequestOptions): void;
  blur(): void;
  focusFirst(): void;
  focusLast(): void;
  focusNext(): void;
  focusPrev(): void;
  focusSelected(): void;
  restoreFocus(): void;
  activateScope(): void;
  deactivateScope(): void;
  isScopeActive(): boolean;
  getEffectiveRovingKey(): FocusRovingKey | undefined;
  getEffectiveGroupKey(): FocusRovingKey | undefined;
  getEffectiveScopeKey(): FocusScopeKey | undefined;
  getFocusableConfig(): FocusableConfig;
  getRovingConfig(): FocusRovingConfig;
  getGroupConfig(): FocusRovingConfig;
  getScopeConfig(): FocusScopeConfig;
  getFacts(): FocusFacts;
  getWarnings(): readonly string[];
};

export type FocusModule = ModuleInstance<FocusFacade> & {
  name: 'focus';
  scope: 'instance';
  port: FocusPort;
};
