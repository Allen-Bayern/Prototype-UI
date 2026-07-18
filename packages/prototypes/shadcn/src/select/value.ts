import { definePrototype } from '@proto.ui/core';
import { asSelectValue } from '@proto.ui/prototypes-base';
import type { ShadcnSelectValueExposes, ShadcnSelectValueProps } from './types';

const selectValue = definePrototype<ShadcnSelectValueProps, ShadcnSelectValueExposes>({
  name: 'shadcn-select-value',
  setup() {
    const value = asSelectValue().stateHandles;
    if (!value) throw new Error('[shadcn-select-value] Select Value must project displayValue.');
    return () => (value.displayValue.get() ? [value.displayValue.get()] : null);
  },
});

export default selectValue;
