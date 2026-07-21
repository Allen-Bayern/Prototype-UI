import { createRef, type ComponentRef } from 'react';

import { ShadcnButton } from '../proto-ui/components/react';

const buttonRef = createRef<ComponentRef<typeof ShadcnButton>>();

export const validButton = (
  <ShadcnButton ref={buttonRef} variant="outline" size="sm" disabled onClick={() => undefined}>
    Save
  </ShadcnButton>
);

// @ts-expect-error The packed adapter must preserve the declared variant union.
export const invalidVariant = <ShadcnButton variant="not-a-variant" />;

// @ts-expect-error The generated facade must not degrade to an `any` component.
export const invalidProp = <ShadcnButton unknownProtoProp />;

const disabled: boolean | undefined = buttonRef.current?.getExposes().disabled.get();
const focusResult: void | undefined = buttonRef.current?.getExposes().focusSelf();
void disabled;
void focusResult;
