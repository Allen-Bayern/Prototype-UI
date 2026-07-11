// packages/adapters/base/src/wiring/host-wiring.ts
import type { HostWiring, WiringSpec } from '../types';
import type { ModuleWiring } from '@proto.ui/runtime';

export function createHostWiring(args: { prototypeName: string; modules: WiringSpec }): HostWiring {
  const { prototypeName } = args;
  let modules = args.modules;

  const wired = new Set<string>();
  let wiringApi: ModuleWiring | null = null;

  const attachCurrent = () => {
    if (!wiringApi) return;
    for (const [name, provide] of Object.entries(modules)) {
      const entries = provide({ prototypeName });
      const ok = wiringApi.attach(name, entries);
      if (ok) wired.add(name);
    }
  };

  return {
    onRuntimeReady(wiring: ModuleWiring) {
      wiringApi = wiring;
      attachCurrent();
    },

    rebind(nextModules: WiringSpec) {
      modules = nextModules;
      // CapsVault.attach replaces entries with matching tokens. All adapter
      // module specs are complete per view epoch, so logical caps stay
      // available while DOM-bound caps move to the fresh root atomically.
      attachCurrent();
    },

    afterUnmount() {
      if (!wiringApi) return;
      for (const name of wired) {
        try {
          wiringApi.reset(name);
        } catch {
          // ignore v0
        }
      }
      wired.clear();
      wiringApi = null;
    },
  };
}
