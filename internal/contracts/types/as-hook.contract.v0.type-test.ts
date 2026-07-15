import { defineAsHook, type AsHookResult, type State } from '@proto.ui/core';
import { asBoundary } from '@proto.ui/hooks';

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
  asHooks: {
    asNested: { close(): void };
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

const nestedHandle = buttonResult.getAsHookHandle?.('asNested');
nestedHandle?.close();

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

const boundary = asBoundary();
boundary.configure({ debugLabel: 'typed-boundary' });
// @ts-expect-error privileged Boundary configuration lives on the returned handle
asBoundary({ debugLabel: 'legacy-parameterized-boundary' });

const asCustomHandle = defineAsHook<
  Props,
  Record<string, never>,
  ButtonContract,
  { hovered: { get(): boolean }; press(): void }
>({
  name: 'asCustomHandle',
  setup(def) {
    def.state.bool('hovered', false);
    def.expose.method('press', () => {});
  },
  projectHandle(result) {
    return {
      hovered: result.getState?.('hovered')!,
      press: result.getMethod?.('press') as () => void,
    };
  },
});

const customHandle = asCustomHandle();
customHandle.hovered.get();
customHandle.press();
// @ts-expect-error a projected caller exposes the custom handle instead of AsHookResult
customHandle.stateHandles;

const asInferredCustomHandle = defineAsHook({
  name: 'asInferredCustomHandle',
  setup() {},
  projectHandle() {
    return { configure(value: boolean) {} };
  },
});

asInferredCustomHandle().configure(true);

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
