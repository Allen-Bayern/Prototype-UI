import type { FocusScopeHandle } from '@proto.ui/core';
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

export function asFocusScope<P extends PropsBaseType = PropsBaseType>(): FocusScopeHandle<P> {
  return getFocusScope() as FocusScopeHandle<P>;
}
