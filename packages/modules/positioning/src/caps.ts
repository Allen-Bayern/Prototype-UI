import { cap, type AnchoredPositionConnection } from '@proto.ui/core';

export interface AnchoredPositionHostLease {
  update(connection: AnchoredPositionConnection): void;
  requestUpdate(): void;
  dispose(): void;
}

export interface AnchoredPositionHost {
  attach(connection: AnchoredPositionConnection): AnchoredPositionHostLease;
}

export const ANCHORED_POSITION_HOST_CAP = cap<AnchoredPositionHost>(
  '@proto.ui/positioning/anchoredHost'
);
