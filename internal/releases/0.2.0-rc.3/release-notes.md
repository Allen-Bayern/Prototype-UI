# Proto UI 0.2.0-rc.3

> Unpublished draft. This candidate records composition improvements derived from external `0.2.0-rc.1` trials. Its complete release train has not opened yet, so current installation and trial instructions must remain pinned to the published `0.2.0-rc.1`.

## Improved

### Continuous nested triggers form one host interaction surface

- Continuous nested trigger prototypes now share one physical focus and accessibility surface: the outermost trigger remains the behavior route owner, while the innermost real host element carries focus, trigger role, disabled state, and accessibility projection.
- A Button nested inside Dialog Close or Trigger no longer creates multiple `role=button` values or competing focus-visible surfaces. Pointer, keyboard, focus, and disabled state merge through the same trigger group.
- React, Vue, and Web Component adapters share instance-tree trigger-surface coordination across mount, dynamic projection, and release.

### Expose methods are directly callable from host refs

- Expose methods returned by React forwarded refs, Vue component refs, and Web Component `getExposes()` now enter their prototype callback scope automatically.
- App Makers can call `dialogRef.current?.getExposes().close('save')` directly without knowing or manually invoking an adapter-internal scope helper.
- Validation or persistence can therefore remain ordinary Button application behavior that closes the Dialog only after success, rather than forcing Save to be a Dialog Close part.

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
- The complete `0.2.0-rc.3` release train will prepare its version entity, package versions, BOM, spec snapshot, and publication gates after the trial findings are collected together.
