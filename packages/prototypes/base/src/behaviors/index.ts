// Behavior helpers should stay on public semantic surfaces and avoid depending on
// internal ports, host thread scheduling details, or event propagation semantics.
// Deprecated helpers remain only until their existing prototype consumers migrate.
export { useFocusRoving } from './use-focus-roving';
export type { FocusRovingExposes, FocusRovingOptions } from './use-focus-roving';
