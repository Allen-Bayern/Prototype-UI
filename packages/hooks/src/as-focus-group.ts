import type { FocusGroupConfigPatch, FocusGroupHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type FocusGroupFacade = {
  getGroup<P extends PropsBaseType = PropsBaseType>(): FocusGroupHandle<P>;
};

const getFocusGroup = definePrivilegedAsHook<PropsBaseType, FocusGroupHandle<PropsBaseType>>({
  name: 'asFocusGroup',
  setup: ({ facades }) => {
    const facade = facades.focus as FocusGroupFacade | undefined;
    if (!facade || typeof facade.getGroup !== 'function') {
      throw new Error(`[AsHook] focus facade unavailable for asFocusGroup.`);
    }
    return facade.getGroup();
  },
});

export function asFocusGroup<P extends PropsBaseType = PropsBaseType>(
  patch?: FocusGroupConfigPatch
): FocusGroupHandle<P> {
  const handle = getFocusGroup() as FocusGroupHandle<P>;
  if (patch) handle.configure(patch);
  return handle;
}
