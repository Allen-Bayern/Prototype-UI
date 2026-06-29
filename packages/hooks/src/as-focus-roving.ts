import type { FocusRovingConfigPatch, FocusRovingHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type FocusRovingFacade = {
  getRoving<P extends PropsBaseType = PropsBaseType>(): FocusRovingHandle<P>;
};

const getFocusRoving = definePrivilegedAsHook<PropsBaseType, FocusRovingHandle<PropsBaseType>>({
  name: 'asFocusRoving',
  setup: ({ facades }) => {
    const facade = facades.focus as FocusRovingFacade | undefined;
    if (!facade || typeof facade.getRoving !== 'function') {
      throw new Error(`[AsHook] focus facade unavailable for asFocusRoving.`);
    }
    return facade.getRoving();
  },
});

export function asFocusRoving<P extends PropsBaseType = PropsBaseType>(
  patch?: FocusRovingConfigPatch
): FocusRovingHandle<P> {
  const handle = getFocusRoving() as FocusRovingHandle<P>;
  if (patch) handle.configure(patch);
  return handle;
}
