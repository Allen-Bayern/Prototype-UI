import { getActiveAsHookContext } from '@proto.ui/core/internal';
import type { PresenceFacade, PresencePhase } from '@proto.ui/module-presence';

export type PresenceOptions = {
  mode?: 'transition' | 'immediate';
};

export type PresenceHandles = {
  setPresent(present: boolean): void;
  getPhase(): PresencePhase;
};

/**
 * Low-level structural-presence control for prototypes whose logical instance
 * must survive view detach (for example lazy/unmount-on-exit compound parts).
 */
export function asPresence(options: PresenceOptions = {}): PresenceHandles {
  const { rt, facades } = getActiveAsHookContext('asPresence');
  rt.ensureSetup('asHook(asPresence)');
  const reg = rt.register('asPresence', { privileged: true, mode: 'once' });
  if (reg.action === 'skip') return reg.state.result as PresenceHandles;

  const facade = facades.presence as PresenceFacade | undefined;
  if (!facade) throw new Error('[asPresence] presence facade is unavailable');
  const handle = facade.createHandle({ mode: options.mode ?? 'immediate' });
  const result: PresenceHandles = Object.freeze({
    setPresent(present: boolean) {
      handle.setIntent(present ? 'enter' : 'leave');
    },
    getPhase() {
      return handle.getPhase();
    },
  });
  reg.state.result = result;
  return result;
}
