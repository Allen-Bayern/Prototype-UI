import {
  cap,
  type ScrollSurfaceHostConnection,
  type ScrollSurfaceHostSupport,
} from '@proto.ui/core';

export interface ScrollSurfaceHostLease {
  update(connection: ScrollSurfaceHostConnection): void;
  request(request: import('@proto.ui/core').ScrollSurfaceRequest): void;
  dispose(): void;
}

export interface ScrollSurfaceHost {
  readonly support: ScrollSurfaceHostSupport;
  readonly preference?: import('@proto.ui/core').ScrollProjectionPreference;
  attach(connection: ScrollSurfaceHostConnection): ScrollSurfaceHostLease;
}

export const SCROLL_SURFACE_HOST_CAP = cap<ScrollSurfaceHost>('@proto.ui/scroll/surfaceHost');
