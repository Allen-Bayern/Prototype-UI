import type { AnchoredPositionHandle, ModuleInstance } from '@proto.ui/core';

export type PositioningFacade = {
  getAnchoredPosition(): AnchoredPositionHandle;
};

export type PositioningPort = {
  getAnchoredPosition(): AnchoredPositionHandle;
};

export type PositioningModule = ModuleInstance<PositioningFacade> & {
  name: 'positioning';
  scope: 'instance';
  port: PositioningPort;
};
