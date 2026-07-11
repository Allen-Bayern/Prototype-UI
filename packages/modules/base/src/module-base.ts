// packages/modules/base/src/module-base.ts
import type { InstancePhase, MountPhase, ProtoPhase } from '@proto.ui/core';
import type { CapsVaultView } from '@proto.ui/core';
import { SYS_CAP } from './system-caps';

export abstract class ModuleBase {
  protected protoPhase: ProtoPhase = 'setup';
  protected instancePhase: InstancePhase = 'setup';
  protected mountPhase: MountPhase = 'detached';
  protected readonly caps: CapsVaultView;

  private pending: Array<() => void> = [];

  constructor(caps: CapsVaultView) {
    this.caps = caps;
    this.caps.onChange((epoch) => {
      this.onCapsEpoch(epoch);
      this.flushPending();
    });
  }

  protected get sys() {
    return this.caps.get(SYS_CAP);
  }

  onProtoPhase(phase: ProtoPhase): void {
    this.protoPhase = phase;
  }

  onInstancePhase(phase: InstancePhase): void {
    this.instancePhase = phase;
  }

  onMountPhase(phase: MountPhase, _epoch: number): void {
    this.mountPhase = phase;
  }

  protected onCapsEpoch(_epoch: number): void {}

  protected defer(fn: () => void): void {
    this.pending.push(fn);
  }

  protected flushPending(): void {
    if (this.pending.length === 0) return;
    const tasks = this.pending;
    this.pending = [];
    for (const t of tasks) t();
  }
}
