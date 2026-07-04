import { defineAsHook, definePrototype, type DefHandle } from '@proto.ui/core';
import { SWITCH_CONTEXT, SWITCH_FAMILY, type SwitchContextValue } from './shared';
import type { SwitchThumbAsHookContract, SwitchThumbExposes, SwitchThumbProps } from './types';

function setupSwitchThumb(def: DefHandle<SwitchThumbProps, SwitchThumbExposes>): void {
  def.anatomy.claim(SWITCH_FAMILY, { role: 'thumb' });
  const checked = def.state.fromAccessibility('checked');

  def.expose.state('checked', checked);

  def.expose.method('isChecked', () => {
    return checked.get();
  });

  const syncContext = (next: SwitchContextValue) => {
    checked.set(!!next.checked, 'reason: switch thumb context checked sync');
  };

  def.context.subscribe(SWITCH_CONTEXT, (_run, next) => {
    syncContext(next);
  });

  def.lifecycle.onMounted((run) => {
    syncContext(run.context.read(SWITCH_CONTEXT));
  });

  def.lifecycle.onUpdated((run) => {
    syncContext(run.context.read(SWITCH_CONTEXT));
  });
}

export const asSwitchThumb = defineAsHook<
  SwitchThumbProps,
  SwitchThumbExposes,
  SwitchThumbAsHookContract
>({
  name: 'as-switch-thumb',
  setup: setupSwitchThumb,
});

const switchThumb = definePrototype({
  name: 'base-switch-thumb',
  setup: setupSwitchThumb,
});

export default switchThumb;
