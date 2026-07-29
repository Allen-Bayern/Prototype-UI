import { createModule, defineModule, type ModuleFactoryArgs } from '@proto.ui/module-base';
import type { StateFacade, StatePort } from '@proto.ui/module-state';
import { ScrollModuleImpl } from './impl';
import type { ScrollFacade, ScrollModule, ScrollPort } from './types';

export function createScrollModule(ctx: ModuleFactoryArgs): ScrollModule {
  const { init, caps, deps } = ctx;
  return createModule<'scroll', 'instance', ScrollFacade, ScrollPort>({
    name: 'scroll',
    scope: 'instance',
    init,
    caps,
    deps,
    build: ({ deps }) => {
      const statePort = deps.requirePort<StatePort>('state');
      const stateFacade = deps.requireFacade<StateFacade>('state');
      const impl = new ScrollModuleImpl(caps, init.prototypeName, statePort, stateFacade);
      return {
        facade: { getSurface: () => impl.getSurface() },
        port: {
          configureSurface: (patch) => impl.configure(patch),
          request: (request) => impl.request(request),
          getConfig: () => impl.getConfig(),
          getSnapshot: () => impl.getSnapshot(),
        },
        hooks: {
          onMountPhase: (phase, epoch) => impl.onMountPhase(phase, epoch),
          onProtoPhase: (phase) => impl.onProtoPhase(phase),
        },
      };
    },
  }) as ScrollModule;
}

export const ScrollModuleDef = defineModule({
  name: 'scroll',
  resourceOwnership: 'mixed',
  deps: ['state'],
  create: createScrollModule,
});
