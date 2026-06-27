import type { OverlayConfigPatch, OverlayHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type OverlayFacade = {
  getOverlay<P extends PropsBaseType = PropsBaseType>(): OverlayHandle<P>;
};

const getOverlay = definePrivilegedAsHook<PropsBaseType, OverlayHandle<PropsBaseType>>({
  name: 'asOverlay',
  setup: ({ facades }) => {
    const facade = facades.overlay as OverlayFacade | undefined;
    if (!facade || typeof facade.getOverlay !== 'function') {
      throw new Error(`[AsHook] overlay facade unavailable for asOverlay.`);
    }
    return facade.getOverlay();
  },
});

export function asOverlay<P extends PropsBaseType = PropsBaseType>(
  patch?: OverlayConfigPatch
): OverlayHandle<P> {
  const handle = getOverlay() as OverlayHandle<P>;
  if (patch) handle.configure(patch);
  return handle;
}
