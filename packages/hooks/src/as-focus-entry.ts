import type { FocusEntryHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type FocusEntryFacade = {
  getEntry<P extends PropsBaseType = PropsBaseType>(): FocusEntryHandle<P>;
};

const getFocusEntry = definePrivilegedAsHook<PropsBaseType, FocusEntryHandle<PropsBaseType>>({
  name: 'asFocusEntry',
  setup: ({ facades }) => {
    const facade = facades.focus as FocusEntryFacade | undefined;
    if (!facade || typeof facade.getEntry !== 'function') {
      throw new Error(`[AsHook] focus facade unavailable for asFocusEntry.`);
    }
    return facade.getEntry();
  },
});

export function asFocusEntry<P extends PropsBaseType = PropsBaseType>(): FocusEntryHandle<P> {
  return getFocusEntry() as FocusEntryHandle<P>;
}
