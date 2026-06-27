import type { FocusableHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type FocusableFacade = {
  getFocusable<P extends PropsBaseType = PropsBaseType>(): FocusableHandle<P>;
};

const getFocusable = definePrivilegedAsHook<PropsBaseType, FocusableHandle<PropsBaseType>>({
  name: 'asFocusable',
  setup: ({ facades }) => {
    const facade = facades.focus as FocusableFacade | undefined;
    if (!facade || typeof facade.getFocusable !== 'function') {
      throw new Error(`[AsHook] focus facade unavailable for asFocusable.`);
    }
    return facade.getFocusable();
  },
});

export function asFocusable<P extends PropsBaseType = PropsBaseType>(): FocusableHandle<P> {
  return getFocusable() as FocusableHandle<P>;
}
