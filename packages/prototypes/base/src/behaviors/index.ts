// Behavior helpers should stay on public semantic surfaces and avoid depending on
// internal ports, host thread scheduling details, or event propagation semantics.
export { useTypeaheadNavigation } from './use-typeahead-navigation';
export type { TypeaheadNavigationOptions } from './use-typeahead-navigation';
