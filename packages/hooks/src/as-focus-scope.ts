import type { FocusScopeConfigPatch, FocusScopeHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type FocusScopeFacade = {
  getScope<P extends PropsBaseType = PropsBaseType>(): FocusScopeHandle<P>;
};

const getFocusScope = definePrivilegedAsHook<PropsBaseType, FocusScopeHandle<PropsBaseType>>({
  name: 'asFocusScope',
  setup: ({ facades }) => {
    const facade = facades.focus as FocusScopeFacade | undefined;
    if (!facade || typeof facade.getScope !== 'function') {
      throw new Error(`[AsHook] focus facade unavailable for asFocusScope.`);
    }
    return facade.getScope();
  },
});

export function asFocusScope<P extends PropsBaseType = PropsBaseType>(
  patch?: FocusScopeConfigPatch
): FocusScopeHandle<P> {
  const handle = getFocusScope() as FocusScopeHandle<P>;
  if (patch) handle.configure(patch);
  return handle;
}
