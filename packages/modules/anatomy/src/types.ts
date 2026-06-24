import type {
  AnatomyClaimDecl,
  AnatomyFamily,
  AnatomyQueryOrderView,
  AnatomyPartView,
  ModuleInstance,
  ModulePort,
  Unsubscribe,
} from '@proto.ui/core';

export type AnatomyDiagnostic = {
  level: 'warning' | 'error';
  scope: 'family' | 'profile';
  code: string;
  message: string;
  family: AnatomyFamily;
  role?: string;
  profile?: string;
};

export type AnatomyOrderCallbackCtx = unknown;
export type AnatomyOrderCallbackDispatcher = (fn: (ctx: AnatomyOrderCallbackCtx) => void) => void;
export type AnatomyOrderChangeCb = (ctx: AnatomyOrderCallbackCtx) => void;

export type AnatomyFacade = {
  claim(family: AnatomyFamily, decl: AnatomyClaimDecl): void;

  has(family: AnatomyFamily, role: string): boolean;
  parts: AnatomyQueryOrderView['parts'];
  partsOf: AnatomyQueryOrderView['partsOf'];
  order: AnatomyQueryOrderView;
};

export type AnatomyPort = ModulePort & {
  getDiagnostics(): readonly AnatomyDiagnostic[];
  parts: AnatomyQueryOrderView['parts'];
  order: AnatomyQueryOrderView;
  setOrderCallbackDispatcher(dispatch: AnatomyOrderCallbackDispatcher): void;
  subscribeOrder(family: AnatomyFamily, cb: AnatomyOrderChangeCb): Unsubscribe;
};

export type AnatomyModule = ModuleInstance<AnatomyFacade> & {
  name: 'anatomy';
  scope: 'instance';
  port?: AnatomyPort;
};
