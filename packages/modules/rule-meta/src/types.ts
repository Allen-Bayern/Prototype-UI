import type { ModuleInstance } from '@proto.ui/core';

export type RuleMetaFacade = {
  /** Reads the current host/environment value when the adapter provides one. */
  get(key: string): unknown;
};

export type RuleMetaModule = ModuleInstance<RuleMetaFacade> & {
  name: 'rule-meta';
  scope: 'instance';
};
