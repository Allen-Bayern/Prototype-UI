import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type AsTriggerFacade = {
  apply(): void;
};

export const asTrigger = definePrivilegedAsHook<PropsBaseType, void>({
  name: 'asTrigger',
  setup: ({ facades }) => {
    const facade = facades['as-trigger'] as AsTriggerFacade | undefined;
    if (!facade || typeof facade.apply !== 'function') {
      throw new Error(`[AsHook] asTrigger facade unavailable.`);
    }
    facade.apply();
  },
});
