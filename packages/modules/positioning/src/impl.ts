import type {
  AnchoredPositionConfig,
  AnchoredPositionConnection,
  AnchoredPositionHandle,
  AnchoredPositionSnapshot,
  CapsVaultView,
  ProtoPhase,
} from '@proto.ui/core';
import { ModuleBase } from '@proto.ui/module-base';
import {
  ANCHORED_POSITION_HOST_CAP,
  type AnchoredPositionHost,
  type AnchoredPositionHostLease,
} from './caps';

export class PositioningModuleImpl extends ModuleBase {
  private connection: AnchoredPositionConnection | null = null;
  private lease: AnchoredPositionHostLease | null = null;
  private snapshot: AnchoredPositionSnapshot | null = null;

  protected override onCapsEpoch(): void {
    if (!this.connection) return;
    this.attach(this.connection);
  }

  override onProtoPhase(phase: ProtoPhase): void {
    super.onProtoPhase(phase);
    if (phase === 'unmounted') this.disconnect();
  }

  private getHost(): AnchoredPositionHost | null {
    return this.caps.has(ANCHORED_POSITION_HOST_CAP)
      ? this.caps.get(ANCHORED_POSITION_HOST_CAP)
      : null;
  }

  private bridge(connection: AnchoredPositionConnection): AnchoredPositionConnection {
    const authoredResolved = connection.onResolved;
    return {
      ...connection,
      onResolved: (snapshot) => {
        this.snapshot = Object.freeze({ ...snapshot });
        authoredResolved?.(this.snapshot);
      },
    };
  }

  private attach(connection: AnchoredPositionConnection): void {
    this.lease?.dispose();
    this.lease = null;
    const host = this.getHost();
    if (!host) return;
    this.lease = host.attach(this.bridge(connection));
  }

  readonly handle: AnchoredPositionHandle = {
    connect: (connection) => {
      const sameTargets =
        this.connection &&
        Object.is(this.connection.anchor, connection.anchor) &&
        Object.is(this.connection.floating, connection.floating);
      this.connection = connection;
      if (sameTargets && this.lease) {
        this.lease.update(this.bridge(connection));
        return;
      }
      this.snapshot = null;
      this.attach(connection);
    },
    update: (config: AnchoredPositionConfig) => {
      if (!this.connection) return;
      this.connection = { ...this.connection, config };
      if (this.lease) {
        this.lease.update(this.bridge(this.connection));
        return;
      }
      this.attach(this.connection);
    },
    requestUpdate: () => this.lease?.requestUpdate(),
    disconnect: () => this.disconnect(),
    getSnapshot: () => this.snapshot,
  };

  disconnect(): void {
    this.lease?.dispose();
    this.lease = null;
    this.connection = null;
    this.snapshot = null;
  }
}
