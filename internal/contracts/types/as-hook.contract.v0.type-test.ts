import { defineAsHook, type AsHookResult, type State } from '@proto.ui/core';

type Props = { disabled?: boolean };

type ButtonContract = {
  state: {
    hovered: State<boolean>;
    pressed: State<boolean>;
  };
  event: {
    click: void;
    submit: { source: 'keyboard' | 'pointer' };
  };
};

declare const buttonResult: AsHookResult<Props, ButtonContract>;

// New contract shape should project state handles and event keys with stable names.
buttonResult.stateHandles?.hovered.get();
buttonResult.stateHandles?.pressed.watch;

const clickKey = buttonResult.artifacts?.eventKeys?.click;
const submitKey = buttonResult.artifacts?.eventKeys?.submit;

const exactClick: 'click' | undefined = clickKey;
const exactSubmit: 'submit' | undefined = submitKey;

// Legacy third generic as raw state map should keep working.
type LegacyStateMap = {
  open: State<boolean>;
};

declare const legacyResult: AsHookResult<Props, LegacyStateMap>;

legacyResult.stateHandles?.open.get();

const asNoArgs = defineAsHook({
  name: 'asNoArgs',
  setup() {},
});

asNoArgs();
// @ts-expect-error authored asHook callers are no-arg in v0
asNoArgs({ enabled: true });

defineAsHook({
  name: 'asNoMode',
  // @ts-expect-error authored asHook definitions do not expose install modes
  mode: 'multiple',
  setup() {},
});

defineAsHook({
  name: 'asNoConfigure',
  setup() {},
  // @ts-expect-error authored asHook definitions do not expose configure callbacks
  configure() {},
});
