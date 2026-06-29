import {
  type FocusFacts,
  type FocusRovingConfig,
  FocusRovingConfigPatch,
  FocusRovingHandle,
  FocusRovingKey,
  type FocusScopeConfig,
  illegalPhase,
  FocusRequestOptions,
  FocusScopeConfigPatch,
  FocusScopeHandle,
  FocusScopeKey,
  type OwnedStateHandle,
  type FocusableConfig,
  FocusableConfigPatch,
  FocusableHandle,
  ObservedStateHandle,
} from '@proto.ui/core';
import { createModule, defineModule, ModuleBase } from '@proto.ui/module-base';
import type { ModuleFactoryArgs } from '@proto.ui/module-base';
import type { PropsBaseType } from '@proto.ui/types';
import type { FocusFacade, FocusModule, FocusPort } from './types';
import type { EventPort } from '@proto.ui/module-event';
import type { StateFacade, StatePort } from '@proto.ui/module-state';
import {
  FOCUS_BLUR_CAP,
  FOCUS_INSTANCE_TOKEN_CAP,
  FOCUS_IS_NATIVELY_FOCUSABLE_CAP,
  FOCUS_PARENT_CAP,
  FOCUS_REQUEST_FOCUS_CAP,
  FOCUS_ROOT_TARGET_CAP,
  FOCUS_RUN_IN_CALLBACK_CAP,
  FOCUS_SET_FOCUSABLE_CAP,
} from './caps';
import { FOCUS_CENTER, type FocusCenterEntry, type FocusRequestBehavior } from './center';

const DEFAULT_FOCUSABLE_CONFIG: FocusableConfig = Object.freeze({
  autoFocus: false,
  disabled: false,
  navParticipation: 'auto',
});

const DEFAULT_SCOPE_CONFIG: FocusScopeConfig = Object.freeze({
  trap: false,
  loop: false,
  navigation: 'tab',
  orientation: 'vertical',
  entry: 'first',
  restore: 'none',
  emptyPolicy: 'none',
});

const DEFAULT_ROVING_CONFIG: FocusRovingConfig = Object.freeze({
  loop: false,
  navigation: 'none',
  orientation: 'vertical',
  entry: 'first',
  selectOnFocus: false,
});

function mergeMeta(
  prev: Readonly<Record<string, unknown>> | undefined,
  next: Readonly<Record<string, unknown>> | undefined
): Readonly<Record<string, unknown>> | undefined {
  if (!next) return prev;
  return Object.freeze({
    ...(prev ?? {}),
    ...next,
  });
}

function pushOverrideWarning(
  warnings: string[],
  owner: 'focusable' | 'scope',
  field: string,
  prev: unknown,
  next: unknown
) {
  if (typeof prev === 'undefined' || Object.is(prev, next)) return;
  warnings.push(`[Focus] ${owner}.${field} overridden: ${String(prev)} -> ${String(next)}`);
}

class FocusModuleImpl extends ModuleBase {
  private focusableConfig: FocusableConfig = DEFAULT_FOCUSABLE_CONFIG;
  private focusableDeclared = false;
  private scopeDeclared = false;
  private rovingDeclared = false;
  private rovingConfig: FocusRovingConfig = DEFAULT_ROVING_CONFIG;
  private scopeConfig: FocusScopeConfig = DEFAULT_SCOPE_CONFIG;
  private readonly prototypeName: string;
  private readonly warnings: string[] = [];
  private didAutoFocus = false;
  private keyboardModality = false;
  private hostEventsWired = false;

  private readonly focusedOwned: OwnedStateHandle<boolean>;
  private readonly focusVisibleOwned: OwnedStateHandle<boolean>;
  private readonly focusableOwned: OwnedStateHandle<boolean>;
  private readonly activeOwned: OwnedStateHandle<boolean>;
  private readonly hasFocusedOwned: OwnedStateHandle<boolean>;

  private readonly focusedState: ObservedStateHandle<boolean, any>;
  private readonly focusVisibleState: ObservedStateHandle<boolean, any>;
  private readonly focusableState: ObservedStateHandle<boolean, any>;
  private readonly activeState: ObservedStateHandle<boolean, any>;
  private readonly hasFocusedState: ObservedStateHandle<boolean, any>;

  private readonly focusableHandle: FocusableHandle<any>;
  private readonly scopeHandle: FocusScopeHandle<any>;
  private readonly rovingHandle: FocusRovingHandle<any>;

  constructor(
    caps: ModuleFactoryArgs['caps'],
    prototypeName: string,
    private readonly eventPort: EventPort,
    private readonly statePort: StatePort,
    stateFacade: StateFacade
  ) {
    super(caps);
    this.prototypeName = prototypeName;

    this.focusedOwned = stateFacade.bool('@focus/focused', false);
    this.focusVisibleOwned = stateFacade.bool('@focus/focusVisible', false);
    this.focusableOwned = stateFacade.bool('@focus/focusable', false);
    this.activeOwned = stateFacade.bool('@focus/active', false);
    this.hasFocusedOwned = stateFacade.bool('@focus/hasFocused', false);

    this.focusedState = statePort.createObservedHandle(this.focusedOwned) as any;
    this.focusVisibleState = statePort.createObservedHandle(this.focusVisibleOwned) as any;
    this.focusableState = statePort.createObservedHandle(this.focusableOwned) as any;
    this.activeState = statePort.createObservedHandle(this.activeOwned) as any;
    this.hasFocusedState = statePort.createObservedHandle(this.hasFocusedOwned) as any;

    this.focusableHandle = {
      focused: this.focusedState,
      focusVisible: this.focusVisibleState,
      focusable: this.focusableState,
      focus: (options?: FocusRequestOptions) => this.requestFocus(options),
      focusSelf: (options?: FocusRequestOptions) => this.requestNativeFocus(options),
      blur: () => this.blur(),
      isFocused: () => this.focusedState.get(),
      setDisabled: (disabled: boolean) => this.setDisabled(disabled),
      configure: (patch: FocusableConfigPatch) => this.configureFocusable(patch),
    };

    this.scopeHandle = {
      active: this.activeState,
      hasFocused: this.hasFocusedState,
      focusFirst: () => this.focusFirst(),
      focusLast: () => this.focusLast(),
      focusNext: () => this.focusNext(),
      focusPrev: () => this.focusPrev(),
      focusSelected: () => this.focusSelected(),
      restoreFocus: () => this.restoreFocus(),
      activate: () => this.activateScope(),
      deactivate: () => this.deactivateScope(),
      isActive: () => this.isScopeActive(),
      configure: (patch: FocusScopeConfigPatch) => this.configureScope(patch),
      getRoving: () => this.getRoving(),
    };

    this.rovingHandle = {
      active: this.activeState,
      hasFocused: this.hasFocusedState,
      focusFirst: () => this.focusFirst(),
      focusLast: () => this.focusLast(),
      focusNext: () => this.focusNext(),
      focusPrev: () => this.focusPrev(),
      focusSelected: () => this.focusSelected(),
      configure: (patch: FocusRovingConfigPatch) => this.configureRoving(patch),
    };
  }

  private ensureSetup(op: string) {
    this.sys?.ensureSetup(op);

    if (!this.sys && this.protoPhase !== 'setup') {
      throw illegalPhase(op, this.protoPhase, {
        prototypeName: this.prototypeName,
      });
    }
  }

  private getRootTarget(): HTMLElement | null {
    if (!this.caps.has(FOCUS_ROOT_TARGET_CAP)) return null;
    const getter = this.caps.get(FOCUS_ROOT_TARGET_CAP);
    return getter?.() ?? null;
  }

  private getCallbackCtx(): unknown {
    return this.sys?.getCallbackCtx?.() ?? undefined;
  }

  private setFocusState(
    handle: OwnedStateHandle<boolean>,
    next: boolean,
    reason?: unknown,
    options?: { defaultOnly?: boolean }
  ): void {
    if (Object.is(handle.get(), next)) return;
    if (options?.defaultOnly) {
      this.statePort.setDefault(handle, next);
      return;
    }
    this.statePort.set(handle, next, reason, this.getCallbackCtx());
  }

  private getSelfToken() {
    if (!this.caps.has(FOCUS_INSTANCE_TOKEN_CAP)) return this.getRootTarget();
    return this.caps.get(FOCUS_INSTANCE_TOKEN_CAP);
  }

  private getParentGetter() {
    if (!this.caps.has(FOCUS_PARENT_CAP)) return () => null;
    return this.caps.get(FOCUS_PARENT_CAP);
  }

  private runInCallbackScope(fn: () => void): void {
    if (this.caps.has(FOCUS_RUN_IN_CALLBACK_CAP)) {
      this.caps.get(FOCUS_RUN_IN_CALLBACK_CAP)(fn);
      return;
    }
    fn();
  }

  private createCenterEntry(): FocusCenterEntry | null {
    const self = this.getSelfToken();
    if (!self) return null;
    return {
      instance: self,
      getParent: this.getParentGetter(),
      isFocusable: () => this.focusableDeclared,
      isScopeProvider: () => this.scopeDeclared,
      isRovingProvider: () => this.rovingDeclared,
      getFocusableConfig: () => this.focusableConfig,
      getScopeConfig: () => this.scopeConfig,
      getRovingConfig: () => this.rovingConfig,
      getFacts: () => this.getFacts(),
      getRootTarget: () => this.getRootTarget(),
      requestFocus: (options?: FocusRequestOptions, behavior?: FocusRequestBehavior) => {
        this.runInCallbackScope(() => {
          if (behavior?.syncFacts === false) {
            this.requestNativeFocusDirect(options);
            return;
          }
          this.requestFocusDirect(options);
        });
      },
      setScopeActive: (active: boolean) => this.setScopeActive(active),
      pushWarning: (message: string) => this.warnings.push(message),
    };
  }

  private syncCenter() {
    const entry = this.createCenterEntry();
    if (!entry) return;
    FOCUS_CENTER.upsert(entry);
  }

  private syncHostFocusable() {
    const target = this.getRootTarget();
    if (!target) return;

    const enabled = this.focusableDeclared && !this.focusableConfig.disabled;
    const isNative = this.caps.has(FOCUS_IS_NATIVELY_FOCUSABLE_CAP)
      ? this.caps.get(FOCUS_IS_NATIVELY_FOCUSABLE_CAP)(target)
      : false;

    if (this.caps.has(FOCUS_SET_FOCUSABLE_CAP)) {
      this.caps.get(FOCUS_SET_FOCUSABLE_CAP)(target, enabled);
      return;
    }

    if (!enabled && isNative) {
      target.tabIndex = -1;
    }
  }

  private declareFocusable(): void {
    if (!this.focusableDeclared) {
      this.focusableDeclared = true;
      this.setFocusState(this.focusableOwned, !this.focusableConfig.disabled, 'focus declared', {
        defaultOnly: true,
      });
    }
    this.wireHostFocusEvents();
    this.syncHostFocusable();
    this.syncCenter();
  }

  private declareScope(): void {
    this.scopeDeclared = true;
    this.syncCenter();
  }

  private declareRoving(): void {
    this.rovingDeclared = true;
    this.syncCenter();
  }

  private wireHostFocusEvents(): void {
    if (this.hostEventsWired) return;
    this.hostEventsWired = true;

    this.eventPort.onGlobal('key.down', () => {
      this.keyboardModality = true;
    });
    this.eventPort.on('pointer.down', () => {
      this.keyboardModality = false;
      this.setFocusState(
        this.focusVisibleOwned,
        false,
        'reason: focus.pointer.down => focusVisible'
      );
    });
    this.eventPort.on('host:focus', () => {
      if (!this.focusableDeclared || this.focusableConfig.disabled) return;
      this.setFocusState(this.focusedOwned, true, 'reason: focus.host:focus => focused');
      this.setFocusState(
        this.focusVisibleOwned,
        this.keyboardModality,
        'reason: focus.host:focus => focusVisible'
      );
      this.setFocusState(this.activeOwned, true, 'reason: focus.host:focus => active');
      this.setFocusState(this.hasFocusedOwned, true, 'reason: focus.host:focus => hasFocused');
    });
    this.eventPort.on('host:blur', () => {
      this.setFocusState(this.focusedOwned, false, 'reason: focus.host:blur => focused');
      this.setFocusState(this.focusVisibleOwned, false, 'reason: focus.host:blur => focusVisible');
      this.setFocusState(this.activeOwned, false, 'reason: focus.host:blur => active');
    });
  }

  getFocusable<P extends PropsBaseType = PropsBaseType>(): FocusableHandle<P> {
    this.declareFocusable();
    return this.focusableHandle as FocusableHandle<P>;
  }

  getScope<P extends PropsBaseType = PropsBaseType>(): FocusScopeHandle<P> {
    this.declareScope();
    return this.scopeHandle as FocusScopeHandle<P>;
  }

  getRoving<P extends PropsBaseType = PropsBaseType>(): FocusRovingHandle<P> {
    this.declareRoving();
    return this.rovingHandle as FocusRovingHandle<P>;
  }

  configureFocusable(patch: FocusableConfigPatch): void {
    this.ensureSetup('focus.configureFocusable');
    this.declareFocusable();
    if (typeof patch.autoFocus !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'focusable',
        'autoFocus',
        this.focusableConfig.autoFocus,
        patch.autoFocus
      );
    }
    if (typeof patch.disabled !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'focusable',
        'disabled',
        this.focusableConfig.disabled,
        patch.disabled
      );
    }
    if (typeof patch.navParticipation !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'focusable',
        'navParticipation',
        this.focusableConfig.navParticipation,
        patch.navParticipation
      );
    }
    if (typeof patch.scopeKey !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'focusable',
        'scopeKey',
        this.focusableConfig.scopeKey?.meta?.debugLabel ?? this.focusableConfig.scopeKey?.id,
        patch.scopeKey?.meta?.debugLabel ?? patch.scopeKey?.id
      );
    }
    if (typeof patch.groupKey !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'focusable',
        'groupKey',
        this.focusableConfig.groupKey?.meta?.debugLabel ?? this.focusableConfig.groupKey?.id,
        patch.groupKey?.meta?.debugLabel ?? patch.groupKey?.id
      );
    }

    this.focusableConfig = Object.freeze({
      ...this.focusableConfig,
      ...patch,
      meta: mergeMeta(this.focusableConfig.meta, patch.meta),
    });
    this.setDisabled(this.focusableConfig.disabled, 'focus config updated');
    this.syncHostFocusable();
    this.syncCenter();
  }

  configureScope(patch: FocusScopeConfigPatch): void {
    this.ensureSetup('focus.configureScope');
    this.declareScope();
    if (typeof patch.key !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'key',
        this.scopeConfig.key?.meta?.debugLabel ?? this.scopeConfig.key?.id,
        patch.key?.meta?.debugLabel ?? patch.key?.id
      );
    }
    if (typeof patch.trap !== 'undefined') {
      pushOverrideWarning(this.warnings, 'scope', 'trap', this.scopeConfig.trap, patch.trap);
    }
    if (typeof patch.loop !== 'undefined') {
      pushOverrideWarning(this.warnings, 'scope', 'loop', this.scopeConfig.loop, patch.loop);
    }
    if (typeof patch.navigation !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'navigation',
        this.scopeConfig.navigation,
        patch.navigation
      );
    }
    if (typeof patch.orientation !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'orientation',
        this.scopeConfig.orientation,
        patch.orientation
      );
    }
    if (typeof patch.entry !== 'undefined') {
      pushOverrideWarning(this.warnings, 'scope', 'entry', this.scopeConfig.entry, patch.entry);
    }
    if (typeof patch.restore !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'restore',
        this.scopeConfig.restore,
        patch.restore
      );
    }
    if (typeof patch.emptyPolicy !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'emptyPolicy',
        this.scopeConfig.emptyPolicy,
        patch.emptyPolicy
      );
    }
    if (typeof patch.group !== 'undefined') {
      pushOverrideWarning(this.warnings, 'scope', 'group', this.scopeConfig.group, patch.group);
      if (patch.group && typeof patch.group === 'object') {
        this.configureRoving(patch.group);
      }
    }

    this.scopeConfig = Object.freeze({
      ...this.scopeConfig,
      ...patch,
      meta: mergeMeta(this.scopeConfig.meta, patch.meta),
    });
  }

  configureRoving(patch: FocusRovingConfigPatch): void {
    this.ensureSetup('focus.configureRoving');
    this.declareRoving();
    if (typeof patch.key !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'roving.key',
        this.rovingConfig.key?.meta?.debugLabel ?? this.rovingConfig.key?.id,
        patch.key?.meta?.debugLabel ?? patch.key?.id
      );
    }
    if (typeof patch.loop !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'roving.loop',
        this.rovingConfig.loop,
        patch.loop
      );
    }
    if (typeof patch.navigation !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'roving.navigation',
        this.rovingConfig.navigation,
        patch.navigation
      );
    }
    if (typeof patch.orientation !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'roving.orientation',
        this.rovingConfig.orientation,
        patch.orientation
      );
    }
    if (typeof patch.entry !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'roving.entry',
        this.rovingConfig.entry,
        patch.entry
      );
    }
    if (typeof patch.selectOnFocus !== 'undefined') {
      pushOverrideWarning(
        this.warnings,
        'scope',
        'roving.selectOnFocus',
        this.rovingConfig.selectOnFocus,
        patch.selectOnFocus
      );
    }

    this.rovingConfig = Object.freeze({
      ...this.rovingConfig,
      ...patch,
      meta: mergeMeta(this.rovingConfig.meta, patch.meta),
    });
    this.syncCenter();
  }

  private requestFocusDirect(options?: FocusRequestOptions): void {
    if (!this.focusableDeclared || this.focusableConfig.disabled) return;
    const target = this.getRootTarget();
    if (target && this.caps.has(FOCUS_REQUEST_FOCUS_CAP)) {
      this.caps.get(FOCUS_REQUEST_FOCUS_CAP)(target, options);
    }
    this.setFocusState(this.focusedOwned, true, options?.reason ?? 'programmatic');
    this.setFocusState(this.focusVisibleOwned, options?.reason === 'keyboard', options?.reason);
    this.setFocusState(this.activeOwned, true, options?.reason ?? 'programmatic');
    this.setFocusState(this.hasFocusedOwned, true, options?.reason ?? 'programmatic');
  }

  requestFocus(options?: FocusRequestOptions): void {
    if (!this.focusableDeclared || this.focusableConfig.disabled) return;
    const entry = this.createCenterEntry();
    if (!entry) {
      this.requestFocusDirect(options);
      return;
    }
    FOCUS_CENTER.requestFocus(entry, options, { syncFacts: true });
  }

  private requestNativeFocusDirect(options?: FocusRequestOptions): void {
    if (!this.focusableDeclared || this.focusableConfig.disabled) return;
    const target = this.getRootTarget();
    if (target && this.caps.has(FOCUS_REQUEST_FOCUS_CAP)) {
      this.caps.get(FOCUS_REQUEST_FOCUS_CAP)(target, options);
    }
  }

  private requestNativeFocus(options?: FocusRequestOptions): void {
    if (!this.focusableDeclared || this.focusableConfig.disabled) return;
    const entry = this.createCenterEntry();
    if (!entry) {
      this.requestNativeFocusDirect(options);
      return;
    }
    FOCUS_CENTER.requestFocus(entry, options, { syncFacts: false });
  }

  blur(): void {
    const target = this.getRootTarget();
    if (target && this.caps.has(FOCUS_BLUR_CAP)) {
      this.caps.get(FOCUS_BLUR_CAP)(target);
    }
    this.setFocusState(this.focusedOwned, false, 'blur');
    this.setFocusState(this.focusVisibleOwned, false, 'blur');
    this.setFocusState(this.activeOwned, false, 'blur');
  }

  focusFirst(): void {
    const entry = this.createCenterEntry();
    if (entry && this.rovingDeclared) {
      FOCUS_CENTER.focusInRoving(entry, 'first');
      return;
    }
    if (this.focusableConfig.disabled) return;
    if (this.scopeConfig.emptyPolicy === 'container') {
      this.setFocusState(this.activeOwned, true, 'focusFirst:container');
      this.setFocusState(this.hasFocusedOwned, false, 'focusFirst:container');
      this.setFocusState(this.focusedOwned, false, 'focusFirst:container');
      this.setFocusState(this.focusVisibleOwned, false, 'focusFirst:container');
      return;
    }
    this.requestFocus({ reason: 'programmatic' });
  }

  focusLast(): void {
    const entry = this.createCenterEntry();
    if (entry && this.rovingDeclared) {
      FOCUS_CENTER.focusInRoving(entry, 'last');
      return;
    }
    this.requestFocus({ reason: 'programmatic' });
  }

  focusNext(): void {
    const entry = this.createCenterEntry();
    if (entry && this.rovingDeclared) {
      FOCUS_CENTER.focusInRoving(entry, 'next');
      return;
    }
    this.requestFocus({ reason: 'programmatic' });
  }

  focusPrev(): void {
    const entry = this.createCenterEntry();
    if (entry && this.rovingDeclared) {
      FOCUS_CENTER.focusInRoving(entry, 'prev');
      return;
    }
    this.requestFocus({ reason: 'programmatic' });
  }

  focusSelected(): void {
    const entry = this.createCenterEntry();
    if (entry && this.rovingDeclared) {
      FOCUS_CENTER.focusInRoving(entry, 'selected');
      return;
    }
    this.requestFocus({ reason: 'programmatic' });
  }

  restoreFocus(): void {
    this.requestFocus({ reason: 'programmatic' });
  }

  activateScope(): void {
    this.declareScope();
    const entry = this.createCenterEntry();
    if (!entry) return;
    FOCUS_CENTER.activateScope(entry);
  }

  deactivateScope(): void {
    const entry = this.createCenterEntry();
    if (!entry) {
      this.setScopeActive(false);
      return;
    }
    FOCUS_CENTER.deactivateScope(entry);
  }

  isScopeActive(): boolean {
    const entry = this.createCenterEntry();
    return entry ? FOCUS_CENTER.isScopeActive(entry) : this.activeState.get();
  }

  private setScopeActive(active: boolean): void {
    this.setFocusState(this.activeOwned, active, active ? 'scope.activate' : 'scope.deactivate');
    if (active) {
      this.setFocusState(this.hasFocusedOwned, true, 'scope.activate');
    }
  }

  setDisabled(disabled: boolean, reason: unknown = 'focus.setDisabled'): void {
    this.focusableConfig = Object.freeze({
      ...this.focusableConfig,
      disabled,
    });
    this.setFocusState(this.focusableOwned, this.focusableDeclared && !disabled, reason, {
      defaultOnly: this.sys?.execPhase?.() === 'setup',
    });
    if (disabled) {
      this.blur();
    }
    this.syncHostFocusable();
    this.syncCenter();
  }

  afterRenderCommit(): void {
    this.syncCenter();
    this.syncHostFocusable();
    if (this.didAutoFocus) return;
    this.didAutoFocus = true;
    if (
      this.focusableDeclared &&
      this.focusableConfig.autoFocus &&
      !this.focusableConfig.disabled
    ) {
      this.requestFocus({ reason: 'programmatic' });
    }
  }

  getEffectiveScopeKey(): FocusScopeKey | undefined {
    return this.focusableConfig.scopeKey ?? this.scopeConfig.key;
  }

  getEffectiveRovingKey(): FocusRovingKey | undefined {
    return this.rovingConfig.key;
  }

  getFocusableConfig(): FocusableConfig {
    return this.focusableConfig;
  }

  getScopeConfig(): FocusScopeConfig {
    return this.scopeConfig;
  }

  getRovingConfig(): FocusRovingConfig {
    return this.rovingConfig;
  }

  getFacts(): FocusFacts {
    return Object.freeze({
      focused: this.focusedState.get(),
      focusVisible: this.focusVisibleState.get(),
      focusable: this.focusableState.get(),
      active: this.activeState.get(),
      hasFocused: this.hasFocusedState.get(),
    });
  }

  getWarnings(): readonly string[] {
    return Object.freeze(this.warnings.slice());
  }

  onProtoPhase(phase: any): void {
    super.onProtoPhase(phase);
    if (phase === 'unmounted') {
      const self = this.getSelfToken();
      if (self) FOCUS_CENTER.remove(self);
    }
  }
}

export function createFocusModule(ctx: ModuleFactoryArgs): FocusModule {
  const { init, caps, deps } = ctx;

  return createModule<'focus', 'instance', FocusFacade, FocusPort>({
    name: 'focus',
    scope: 'instance',
    init,
    caps,
    deps,
    build: ({ deps }) => {
      const eventPort = deps.requirePort<EventPort>('event');
      const statePort = deps.requirePort<StatePort>('state');
      const stateFacade = deps.requireFacade<StateFacade>('state');
      const impl = new FocusModuleImpl(caps, init.prototypeName, eventPort, statePort, stateFacade);
      const port: FocusPort = {
        configureFocusable: (patch) => impl.configureFocusable(patch),
        configureRoving: (patch) => impl.configureRoving(patch),
        configureGroup: (patch) => impl.configureRoving(patch),
        configureScope: (patch) => impl.configureScope(patch),
        setDisabled: (disabled) => impl.setDisabled(disabled),
        requestFocus: (options) => impl.requestFocus(options),
        blur: () => impl.blur(),
        focusFirst: () => impl.focusFirst(),
        focusLast: () => impl.focusLast(),
        focusNext: () => impl.focusNext(),
        focusPrev: () => impl.focusPrev(),
        focusSelected: () => impl.focusSelected(),
        restoreFocus: () => impl.restoreFocus(),
        activateScope: () => impl.activateScope(),
        deactivateScope: () => impl.deactivateScope(),
        isScopeActive: () => impl.isScopeActive(),
        getEffectiveRovingKey: () => impl.getEffectiveRovingKey(),
        getEffectiveGroupKey: () => impl.getEffectiveRovingKey(),
        getEffectiveScopeKey: () => impl.getEffectiveScopeKey(),
        getFocusableConfig: () => impl.getFocusableConfig(),
        getRovingConfig: () => impl.getRovingConfig(),
        getGroupConfig: () => impl.getRovingConfig(),
        getScopeConfig: () => impl.getScopeConfig(),
        getFacts: () => impl.getFacts(),
        getWarnings: () => impl.getWarnings(),
      };

      return {
        facade: {
          getFocusable: () => impl.getFocusable(),
          getRoving: () => impl.getRoving(),
          getScope: () => impl.getScope(),
        },
        hooks: {
          onProtoPhase: (p) => impl.onProtoPhase(p),
          afterRenderCommit: () => impl.afterRenderCommit(),
        },
        port,
      };
    },
  }) as FocusModule;
}

export const FocusModuleDef = defineModule({
  name: 'focus',
  deps: ['event', 'state'],
  create: createFocusModule,
});
