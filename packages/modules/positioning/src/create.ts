import { createModule, defineModule, type ModuleFactoryArgs } from '@proto.ui/module-base';
import { PositioningModuleImpl } from './impl';
import type { PositioningFacade, PositioningModule, PositioningPort } from './types';

export function createPositioningModule(ctx: ModuleFactoryArgs): PositioningModule {
  const { init, caps, deps } = ctx;
  const impl = new PositioningModuleImpl(caps);

  return createModule<'positioning', 'instance', PositioningFacade, PositioningPort>({
    name: 'positioning',
    scope: 'instance',
    init,
    caps,
    deps,
    build: () => ({
      facade: { getAnchoredPosition: () => impl.handle },
      port: { getAnchoredPosition: () => impl.handle },
      hooks: {
        onProtoPhase: (phase) => impl.onProtoPhase(phase),
      },
    }),
  }) as PositioningModule;
}

export const PositioningModuleDef = defineModule({
  name: 'positioning',
  resourceOwnership: 'mixed',
  deps: [],
  create: createPositioningModule,
});
