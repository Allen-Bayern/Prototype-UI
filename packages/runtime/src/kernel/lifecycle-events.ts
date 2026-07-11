import type { InstancePhase, MountPhase } from '@proto.ui/core';
import type { RuntimeCheckpoint } from './timeline';

export type RuntimeLifecycleEvent =
  | { type: 'instance.setup.exit' }
  | { type: 'instance.created' }
  | { type: 'instance.phase'; phase: InstancePhase }
  | { type: 'mount.phase'; phase: MountPhase; epoch: number }
  | { type: 'mount.render'; epoch: number }
  | { type: 'mount.commit.start'; epoch: number }
  | { type: 'mount.commit.done'; epoch: number }
  | { type: 'mount.mounted'; epoch: number }
  | { type: 'update.render'; epoch: number; revision: number }
  | { type: 'update.commit.done'; epoch: number; revision: number }
  | { type: 'update.updated'; epoch: number; revision: number }
  | { type: 'unmount.begin'; epoch: number }
  | { type: 'unmount.done'; epoch: number }
  | { type: 'instance.dispose.begin' }
  | { type: 'instance.dispose.done' };

/**
 * Deprecated CP0-CP10 projection. It is intentionally lossy: repeated mount
 * epochs and the unmount/dispose split cannot be represented faithfully by
 * the old string checkpoint model.
 */
export function projectLegacyCheckpoint(
  event: RuntimeLifecycleEvent
): RuntimeCheckpoint | undefined {
  switch (event.type) {
    case 'instance.setup.exit':
      return 'CP0_SETUP_EXIT';
    case 'instance.created':
      return 'CP1_CREATED_CALLBACKS';
    case 'mount.render':
      return 'CP2_LOGICAL_TREE_READY';
    case 'mount.commit.start':
      return 'CP3_COMMIT_START';
    case 'mount.commit.done':
      return 'CP4_COMMIT_DONE';
    case 'mount.mounted':
      return 'CP5_MOUNTED_CALLBACKS';
    case 'update.render':
      return 'CP6_UPDATE_RENDER';
    case 'update.commit.done':
      return 'CP7_UPDATE_COMMIT_DONE';
    case 'update.updated':
      return 'CP8_UPDATED_CALLBACKS';
    case 'unmount.begin':
      return 'CP9_UNMOUNT_BEGIN';
    case 'instance.dispose.done':
      return 'CP10_DISPOSE_COMPLETE';
    default:
      return undefined;
  }
}
