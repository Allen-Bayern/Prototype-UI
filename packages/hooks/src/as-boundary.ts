import type { BoundaryHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type BoundaryFacade = {
  getBoundary<P extends PropsBaseType = PropsBaseType>(): BoundaryHandle<P>;
};

const getBoundary = definePrivilegedAsHook<PropsBaseType, BoundaryHandle<PropsBaseType>>({
  name: 'asBoundary',
  setup: ({ facades }) => {
    const facade = facades.boundary as BoundaryFacade | undefined;
    if (!facade || typeof facade.getBoundary !== 'function') {
      throw new Error('[AsHook] boundary facade unavailable for asBoundary.');
    }
    return facade.getBoundary();
  },
});

export function asBoundary<P extends PropsBaseType = PropsBaseType>(): BoundaryHandle<P> {
  return getBoundary() as BoundaryHandle<P>;
}
