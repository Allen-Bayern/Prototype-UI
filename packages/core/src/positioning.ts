export type AnchoredPositionSide = 'top' | 'right' | 'bottom' | 'left';
export type AnchoredPositionAlign = 'start' | 'center' | 'end';
export type AnchoredPositionStrategy = 'absolute' | 'fixed';
export type AnchoredCollisionBoundary = 'clippingAncestors' | 'viewport';

export type AnchoredPositionConfig = Readonly<{
  side: AnchoredPositionSide;
  align: AnchoredPositionAlign;
  sideOffset: number;
  alignOffset: number;
  strategy: AnchoredPositionStrategy;
  avoidCollisions: boolean;
  collisionBoundary: AnchoredCollisionBoundary;
  collisionPadding: number;
}>;

export type AnchoredPositionSnapshot = Readonly<{
  side: AnchoredPositionSide;
  align: AnchoredPositionAlign;
  strategy: AnchoredPositionStrategy;
}>;

export type AnchoredPositionConnection = Readonly<{
  anchor: unknown;
  floating: unknown;
  config: AnchoredPositionConfig;
  onResolved?(snapshot: AnchoredPositionSnapshot): void;
}>;

export interface AnchoredPositionHandle {
  connect(connection: AnchoredPositionConnection): void;
  update(config: AnchoredPositionConfig): void;
  requestUpdate(): void;
  disconnect(): void;
  getSnapshot(): AnchoredPositionSnapshot | null;
}
