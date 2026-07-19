export type {
  TabsRootProps,
  TabsRootExposes,
  TabsRootStateHandles,
  TabsRootAsHookContract,
  TabsListProps,
  TabsListExposes,
  TabsListAsHookContract,
  TabsTriggerProps,
  TabsTriggerExposes,
  TabsTriggerStateHandles,
  TabsTriggerAsHookContract,
  TabsContentProps,
  TabsContentExposes,
  TabsContentStateHandles,
  TabsContentAsHookContract,
  TabsIndicatorProps,
  TabsIndicatorExposes,
  TabsIndicatorStateHandles,
  TabsIndicatorAsHookContract,
} from './types';
export type { TabsActivationMode, TabsContextValue, TabsOrientation } from './shared';

export { TABS_CONTEXT, TABS_FAMILY } from './shared';
export { asTabsRoot, default as tabsRoot } from './root.proto';
export { asTabsList, default as tabsList } from './list.proto';
export { asTabsTrigger, default as tabsTrigger } from './trigger.proto';
export { asTabsContent, default as tabsContent } from './content.proto';
export { asTabsIndicator, default as tabsIndicator } from './indicator.proto';
