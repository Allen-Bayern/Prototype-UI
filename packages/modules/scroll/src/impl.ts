import type {
  MountPhase,
  OwnedStateHandle,
  ProtoPhase,
  ScrollAxes,
  ScrollAxisSnapshot,
  ScrollResolvedProjection,
  ScrollSurfaceConfig,
  ScrollSurfaceConfigPatch,
  ScrollSurfaceHandle,
  ScrollSurfaceRequest,
  ScrollSurfaceSnapshot,
} from '@proto.ui/core';
import { illegalPhase } from '@proto.ui/core';
import { ModuleBase, type ModuleFactoryArgs } from '@proto.ui/module-base';
import type { StateFacade, StatePort } from '@proto.ui/module-state';
import type { PropsBaseType } from '@proto.ui/types';
import {
  SCROLL_SURFACE_HOST_CAP,
  type ScrollSurfaceHost,
  type ScrollSurfaceHostLease,
} from './caps';
import { resolveScrollProjection } from './projection';

const EMPTY_AXIS: ScrollAxisSnapshot = Object.freeze({
  position: 0,
  visibleRatio: 1,
  canScrollBefore: false,
  canScrollAfter: false,
});

const DEFAULT_CONFIG: ScrollSurfaceConfig = Object.freeze({
  axes: 'both',
  projection: 'auto',
});

const clampRatio = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

export class ScrollModuleImpl extends ModuleBase {
  private config: ScrollSurfaceConfig = DEFAULT_CONFIG;
  private declared = false;
  private lease: ScrollSurfaceHostLease | null = null;
  private mounted = false;

  private readonly axesOwned: OwnedStateHandle<ScrollAxes>;
  private readonly scrollingOwned: OwnedStateHandle<boolean>;
  private readonly projectionOwned: OwnedStateHandle<ScrollResolvedProjection>;
  private readonly horizontalPositionOwned: OwnedStateHandle<number>;
  private readonly horizontalVisibleOwned: OwnedStateHandle<number>;
  private readonly horizontalBeforeOwned: OwnedStateHandle<boolean>;
  private readonly horizontalAfterOwned: OwnedStateHandle<boolean>;
  private readonly verticalPositionOwned: OwnedStateHandle<number>;
  private readonly verticalVisibleOwned: OwnedStateHandle<number>;
  private readonly verticalBeforeOwned: OwnedStateHandle<boolean>;
  private readonly verticalAfterOwned: OwnedStateHandle<boolean>;

  private readonly handle: ScrollSurfaceHandle<PropsBaseType>;

  constructor(
    caps: ModuleFactoryArgs['caps'],
    private readonly prototypeName: string,
    private readonly statePort: StatePort,
    stateFacade: StateFacade
  ) {
    super(caps);
    this.axesOwned = stateFacade.enum('@scroll/axes', 'both', {
      options: ['horizontal', 'vertical', 'both'] as const,
    });
    this.scrollingOwned = stateFacade.bool('@scroll/scrolling', false);
    this.projectionOwned = stateFacade.enum('@scroll/projection', 'unresolved', {
      options: ['unresolved', 'system', 'composed'] as const,
    });
    this.horizontalPositionOwned = this.createRatio(stateFacade, '@scroll/horizontalPosition', 0);
    this.horizontalVisibleOwned = this.createRatio(
      stateFacade,
      '@scroll/horizontalVisibleRatio',
      1
    );
    this.horizontalBeforeOwned = stateFacade.bool('@scroll/horizontalCanScrollBefore', false);
    this.horizontalAfterOwned = stateFacade.bool('@scroll/horizontalCanScrollAfter', false);
    this.verticalPositionOwned = this.createRatio(stateFacade, '@scroll/verticalPosition', 0);
    this.verticalVisibleOwned = this.createRatio(stateFacade, '@scroll/verticalVisibleRatio', 1);
    this.verticalBeforeOwned = stateFacade.bool('@scroll/verticalCanScrollBefore', false);
    this.verticalAfterOwned = stateFacade.bool('@scroll/verticalCanScrollAfter', false);

    this.handle = {
      axes: this.observed(this.axesOwned),
      horizontal: {
        position: this.observed(this.horizontalPositionOwned),
        visibleRatio: this.observed(this.horizontalVisibleOwned),
        canScrollBefore: this.observed(this.horizontalBeforeOwned),
        canScrollAfter: this.observed(this.horizontalAfterOwned),
      },
      vertical: {
        position: this.observed(this.verticalPositionOwned),
        visibleRatio: this.observed(this.verticalVisibleOwned),
        canScrollBefore: this.observed(this.verticalBeforeOwned),
        canScrollAfter: this.observed(this.verticalAfterOwned),
      },
      scrolling: this.observed(this.scrollingOwned),
      projection: this.observed(this.projectionOwned),
      configure: (patch) => this.configure(patch),
      request: (request) => this.request(request),
      getSnapshot: () => this.getSnapshot(),
    };
  }

  private createRatio(stateFacade: StateFacade, semantic: string, value: number) {
    return stateFacade.numberRange(semantic, value, { min: 0, max: 1, clamp: true });
  }

  private observed<V>(handle: OwnedStateHandle<V>) {
    return this.statePort.createObservedHandle(handle) as never;
  }

  private ensureSetup(operation: string): void {
    this.sys?.ensureSetup(operation);
    if (!this.sys && this.protoPhase !== 'setup') {
      throw illegalPhase(operation, this.protoPhase, { prototypeName: this.prototypeName });
    }
  }

  getSurface<P extends PropsBaseType = PropsBaseType>(): ScrollSurfaceHandle<P> {
    this.declared = true;
    if (this.mounted) this.attach();
    return this.handle as ScrollSurfaceHandle<P>;
  }

  configure(patch: ScrollSurfaceConfigPatch): void {
    this.ensureSetup('asScrollSurface().configure');
    this.config = Object.freeze({
      ...this.config,
      ...patch,
      requireProjection:
        typeof patch.requireProjection === 'undefined'
          ? this.config.requireProjection
          : patch.requireProjection,
    });
    this.set(this.axesOwned, this.config.axes);
  }

  request(request: ScrollSurfaceRequest): void {
    if (!this.declared) return;
    const normalized =
      request.kind === 'to' || request.kind === 'control-drag'
        ? { ...request, position: clampRatio(request.position) }
        : request;
    this.lease?.request(normalized);
  }

  getConfig(): ScrollSurfaceConfig {
    return this.config;
  }

  getSnapshot(): ScrollSurfaceSnapshot {
    return Object.freeze({
      axes: this.axesOwned.get(),
      horizontal: Object.freeze({
        position: this.horizontalPositionOwned.get(),
        visibleRatio: this.horizontalVisibleOwned.get(),
        canScrollBefore: this.horizontalBeforeOwned.get(),
        canScrollAfter: this.horizontalAfterOwned.get(),
      }),
      vertical: Object.freeze({
        position: this.verticalPositionOwned.get(),
        visibleRatio: this.verticalVisibleOwned.get(),
        canScrollBefore: this.verticalBeforeOwned.get(),
        canScrollAfter: this.verticalAfterOwned.get(),
      }),
      scrolling: this.scrollingOwned.get(),
      projection: this.projectionOwned.get(),
    });
  }

  protected override onCapsEpoch(): void {
    if (this.mounted && this.declared) this.attach();
  }

  override onMountPhase(phase: MountPhase, epoch: number): void {
    super.onMountPhase(phase, epoch);
    this.mounted = phase === 'mounted';
    if (phase === 'mounted') {
      if (this.declared) this.attach();
      return;
    }
    if (phase === 'detached') this.disconnect();
  }

  override onProtoPhase(phase: ProtoPhase): void {
    super.onProtoPhase(phase);
    if (phase === 'unmounted') this.disconnect();
  }

  private getHost(): ScrollSurfaceHost | null {
    return this.caps.has(SCROLL_SURFACE_HOST_CAP) ? this.caps.get(SCROLL_SURFACE_HOST_CAP) : null;
  }

  private attach(): void {
    this.lease?.dispose();
    this.lease = null;
    const host = this.getHost();
    if (!host) {
      this.set(this.projectionOwned, 'unresolved');
      return;
    }
    const projection = resolveScrollProjection(this.config, host.support, host.preference);
    this.set(this.projectionOwned, projection);
    this.lease = host.attach({
      config: this.config,
      projection,
      onFacts: (snapshot) => this.applySnapshot(snapshot),
    });
  }

  private applySnapshot(snapshot: ScrollSurfaceSnapshot): void {
    this.set(this.axesOwned, snapshot.axes);
    this.applyAxis('horizontal', snapshot.horizontal);
    this.applyAxis('vertical', snapshot.vertical);
    this.set(this.scrollingOwned, snapshot.scrolling);
    this.set(this.projectionOwned, snapshot.projection);
  }

  private applyAxis(axis: 'horizontal' | 'vertical', snapshot: ScrollAxisSnapshot): void {
    const value = snapshot ?? EMPTY_AXIS;
    const handles =
      axis === 'horizontal'
        ? [
            this.horizontalPositionOwned,
            this.horizontalVisibleOwned,
            this.horizontalBeforeOwned,
            this.horizontalAfterOwned,
          ]
        : [
            this.verticalPositionOwned,
            this.verticalVisibleOwned,
            this.verticalBeforeOwned,
            this.verticalAfterOwned,
          ];
    this.set(handles[0] as OwnedStateHandle<number>, clampRatio(value.position));
    this.set(handles[1] as OwnedStateHandle<number>, clampRatio(value.visibleRatio));
    this.set(handles[2] as OwnedStateHandle<boolean>, value.canScrollBefore);
    this.set(handles[3] as OwnedStateHandle<boolean>, value.canScrollAfter);
  }

  private set<V>(handle: OwnedStateHandle<V>, value: V): void {
    if (Object.is(handle.get(), value)) return;
    this.statePort.set(handle, value, 'reason: scroll host fact');
  }

  disconnect(): void {
    this.lease?.dispose();
    this.lease = null;
    this.set(this.scrollingOwned, false);
    this.set(this.projectionOwned, 'unresolved');
  }
}
