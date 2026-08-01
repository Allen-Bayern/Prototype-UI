import {
  declareModule,
  moduleDeclaration,
  type ModuleDeclarationToken,
  type PrototypeModuleDeclaration,
} from '@proto.ui/core';

export type TextControlWebTarget = Readonly<{
  namespace: 'web';
  localName: 'textarea';
}>;

export type TextControlDeclaration = Readonly<{
  target: TextControlWebTarget;
}>;

export const TEXT_CONTROL_DECLARATION: ModuleDeclarationToken<TextControlDeclaration> =
  moduleDeclaration<TextControlDeclaration>('@proto.ui/text-control/declaration');

export function declareTextControl(
  config: TextControlDeclaration
): PrototypeModuleDeclaration<TextControlDeclaration> {
  return declareModule(TEXT_CONTROL_DECLARATION, config);
}
