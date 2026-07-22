# Proto UI 0.2.0-rc.2

> Unpublished draft. This candidate continues collecting findings from external `0.2.0-rc.1` trials; its complete release train has not opened yet, so current installation and trial instructions must remain pinned to the published `0.2.0-rc.1`.

## Fixed

### Prop removal restores defaults

- Props resolution now treats `missing` as the host withdrawing that input. When a valid provided value becomes an omitted key, resolution no longer retains the withdrawn value through `prevValid`; it returns to `setDefaults`, declaration `default`, or canonical `null`.
- `prevValid` remains available when a key is still provided but its current value is empty or invalid, keeping invalid-input recovery separate from prop-removal semantics.
- React, Vue, and Web Component hosts share this behavior through the Props Kernel without adapter-specific exceptions.
- Removing `disabled` from a React Shadcn Button restores the enabled state, while removing `variant` or `size` restores the corresponding default tokens.
- Removing Lucide Icon visual props such as `size`, `strokeWidth`, or `stroke` restores protocol defaults such as 24, 2, and currentColor.
- Cross-adapter resolved-snapshot conformance, Base Button behavior tests, and Shadcn Button visual-token tests cover provided-to-missing transitions.

### Scoped Web box-model baseline

- Generated Proto UI token CSS now applies `box-sizing: border-box` to elements carrying `data-pui-style` and their `::before` / `::after` pseudo-elements, preserving declared component dimensions when a host has no Tailwind Preflight or global reset.
- The baseline is scoped to Proto UI style projection. It does not install a document-wide `*` reset, alter unrelated host elements, or enter the Shadcn theme-variable file.
- Shadcn Switch track movement now uses canonical `pl-5` / `pr-5` spacing tokens instead of the equivalent `[20px]` arbitrary values.
- CSS renderer, CLI init, and Shadcn Switch tests cover the generated baseline, output ownership, and canonical spacing-token surface.

### Nested trigger routing

- React, Vue, and Web Component adapters now keep continuous nested-trigger logical route owners separate from physical `EventTarget` objects instead of forcing opaque logical tokens through the event target path.
- Structures such as nested Buttons or Buttons inside Dialog Trigger / Close can activate through the outermost continuous trigger route without throwing `redirectRoot() requires an EventTarget-like object`.
- Logical owners use a stable dynamic event-target projection, so existing event registrations bind or migrate to the current router target when an owner view appears after setup or a presence/lifecycle transition creates a new view epoch.
- Failed adapter-owner initialization now rolls back partial wiring and session state, preventing React recovery from producing the misleading follow-up `owner is already initialized` error.
- Runtime, adapter-base, real ReactDOM, Vue renderer, and Web Component Dialog tests cover logical/physical identity separation, late targets, repeatable view binding, and click and keyboard activation.

## Still under validation

- Additional installation, runtime, CSS, accessibility, bundle, and API findings from post-publication `0.2.0-rc.1` trials.
- The complete `0.2.0-rc.2` release train will prepare its version entity, package versions, BOM, spec snapshot, and publication gates after the trial findings are collected together.
