import type { HitParticipationConfigPatch, HitParticipationHandle } from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';
import { definePrivilegedAsHook } from './privileged';

type HitParticipationFacade = {
  getHitParticipation<P extends PropsBaseType = PropsBaseType>(): HitParticipationHandle<P>;
};

const getHitParticipation = definePrivilegedAsHook<
  PropsBaseType,
  HitParticipationHandle<PropsBaseType>
>({
  name: 'asHitParticipation',
  setup: ({ facades }) => {
    const facade = facades['hit-participation'] as HitParticipationFacade | undefined;
    if (!facade || typeof facade.getHitParticipation !== 'function') {
      throw new Error('[AsHook] hit-participation facade unavailable for asHitParticipation.');
    }
    return facade.getHitParticipation();
  },
});

export function asHitParticipation<P extends PropsBaseType = PropsBaseType>(
  patch?: HitParticipationConfigPatch
): HitParticipationHandle<P> {
  const handle = getHitParticipation() as HitParticipationHandle<P>;
  if (patch) handle.configure(patch);
  return handle;
}
