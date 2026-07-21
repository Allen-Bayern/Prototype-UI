import type { ComponentProps, ComponentRef } from 'react';

import { ShadcnButton as ReactShadcnButton } from './proto-ui/components/react';
import { ShadcnButton as VueShadcnButton } from './proto-ui/components/vue';
import { ShadcnButtonElement } from './proto-ui/components/wc';

type ReactButtonProps = ComponentProps<typeof ReactShadcnButton>;
type ReactButtonHandle = ComponentRef<typeof ReactShadcnButton>;

const reactValid: ReactButtonProps = { variant: 'outline', size: 'sm', disabled: true };
// @ts-expect-error Packed React facade must preserve the declared variant union.
const reactInvalidVariant: ReactButtonProps = { variant: 'not-a-variant' };
// @ts-expect-error Packed React facade must not accept unknown props through `any`.
const reactInvalidProp: ReactButtonProps = { unknownProtoProp: true };
declare const reactHandle: ReactButtonHandle;
const reactDisabled: boolean = reactHandle.getExposes().disabled.get();

type VueButtonInstance = InstanceType<typeof VueShadcnButton>;
type VueButtonProps = VueButtonInstance['$props'];

const vueValid: VueButtonProps = { variant: 'outline', size: 'sm', disabled: true };
// @ts-expect-error Packed Vue facade must preserve the declared variant union.
const vueInvalidVariant: VueButtonProps = { variant: 'not-a-variant' };
// @ts-expect-error Packed Vue facade must not accept unknown props through `any`.
const vueInvalidProp: VueButtonProps = { unknownProtoProp: true };
declare const vueInstance: VueButtonInstance;
const vueDisabled: boolean = vueInstance.getExposes().disabled.get();

type WebComponentButton = InstanceType<typeof ShadcnButtonElement>;
type WebComponentButtonProps = NonNullable<WebComponentButton['__protoUiProps']>;

const webComponentValid: WebComponentButtonProps = {
  variant: 'outline',
  size: 'sm',
  disabled: true,
};
// @ts-expect-error Packed Web Component facade must preserve the declared variant union.
const webComponentInvalidVariant: WebComponentButtonProps = { variant: 'not-a-variant' };
// @ts-expect-error Packed Web Component facade must not accept unknown props through `any`.
const webComponentInvalidProp: WebComponentButtonProps = { unknownProtoProp: true };
declare const webComponentElement: WebComponentButton;
const webComponentDisabled: boolean = webComponentElement.getExposes().disabled.get();

void reactValid;
void reactInvalidVariant;
void reactInvalidProp;
void reactDisabled;
void vueValid;
void vueInvalidVariant;
void vueInvalidProp;
void vueDisabled;
void webComponentValid;
void webComponentInvalidVariant;
void webComponentInvalidProp;
void webComponentDisabled;
