# Proto UI 0.2.0-rc.3

> Published on July 22, 2026 under the npm `next` channel. All 37 public packages, the `v0.2.0-rc.3` tag, the GitHub prerelease, and the immutable spec snapshot share this exact release identity.

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

### Complete CLI Shadcn style presets

- `proto-ui init` now emits the same token CSS closure as scanning the official Shadcn prototype sources, instead of relying on an independently maintained preset list that could drift.
- External projects receive Dialog enter and leave keyframes plus animate, fade, and zoom utilities, restoring visible motion while preserving the existing 150ms Mask and 200ms Content lifecycle timing.
- The preset manifest is generated deterministically and guarded by a stale check, exact init-to-source parity coverage, and packed CLI consumer smoke assertions.

## Improved

### Continuous nested triggers form one host interaction surface

- Continuous nested trigger prototypes now share one physical focus and accessibility surface: the outermost trigger remains the behavior route owner, while the innermost real host element carries focus, trigger role, disabled state, and accessibility projection.
- A Button nested inside Dialog Close or Trigger no longer creates multiple `role=button` values or competing focus-visible surfaces. Pointer, keyboard, focus, and disabled state merge through the same trigger group.
- React, Vue, and Web Component adapters share instance-tree trigger-surface coordination across mount, dynamic projection, and release.

### Expose methods are directly callable from host refs

- Expose methods returned by React forwarded refs, Vue component refs, and Web Component `getExposes()` now enter their prototype callback scope automatically.
- App Makers can call `dialogRef.current?.getExposes().close('save')` directly without knowing or manually invoking an adapter-internal scope helper.
- Validation or persistence can therefore remain ordinary Button application behavior that closes the Dialog only after success, rather than forcing Save to be a Dialog Close part.

### React refs no longer cause false props update loops

- The React adapter now compares adapter-projected raw props snapshots instead of treating React's internal props-object identity as a runtime input change.
- React 19 may reconstruct a props object while stripping `ref` for `forwardRef`; that host implementation detail no longer creates an infinite cycle between feedback commits, `setHostTokens()`, and adapter updates.
- CLI presets also avoid writing an empty `ref` key to raw facades when no forwarded ref exists, while preserving transparent forwarding for real refs.
- Real ReactDOM regression coverage and the isolated tarball consumer smoke exercise a styled Dialog Content with a ref, genuine prop updates, and the generated facade.

### CLI component presets and the Switch default Thumb

- The CLI registry and facade generator now support a `replaceable-default-part` component preset with distinct states for an absent input that adopts the default, a compatible replacement, and explicit omission.
- Generated Shadcn Switch convenience facades materialize Thumb by default while allowing a React `thumb`, Vue `#thumb`, direct Thumb child, or Web Component omission attribute to override that behavior.
- Raw `ShadcnSwitchRoot` and `ShadcnSwitchThumb` facades remain available. Anatomy validates composition and does not secretly create prototype instances at runtime.

### Shadcn Dialog composition surfaces

- `ShadcnDialogClose` is now an unstyled semantic close boundary. Button visuals come from an explicitly nested `ShadcnButton`, with continuous trigger merging preserving one host interaction surface.
- Layout-only `ShadcnDialogHeader` and `ShadcnDialogFooter` parts are available, while Footer defines no Confirm, Cancel, or Save semantics.
- A separate accessible `ShadcnDialogCloseIcon` now represents the X close surface. Generated `ShadcnDialogContent` convenience facades materialize it by default and allow compatible replacement or explicit omission.
- The generator retains `ShadcnDialogContentRaw` for callers that want to opt out of preset behavior completely.

## Still under validation

- The applicability of component presets across additional compound components and adapters; Switch Thumb and Dialog Content CloseIcon are the current validation slices.
- More complex multi-level focus-visible, role transfer, and non-Web host projection for continuous nested triggers.
- Additional installation, runtime, CSS, accessibility, bundle, composition, and API findings from post-publication `0.2.0-rc.3` trials will enter a later release train.
