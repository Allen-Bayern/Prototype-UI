# Proto UI 0.2.0-rc.1

> Published on July 21, 2026 under the npm `next` channel. All 37 public packages, the `v0.2.0-rc.1` tag, the GitHub prerelease, and the immutable spec snapshot share this exact release identity.

## Fixed

### Adapter public type preservation

- React and Vue adapters now preserve the complete Prototype identity when producing host components, so generated facades retain exact props and outward-event listener types instead of degrading to `any`.
- React refs, Vue exposed instances, and Web Component elements now project typed expose values, methods, and read-only external state handles.
- Web Component constructors carry their source Prototype type and export a reusable props projection utility for host tooling.
- Packed-consumer release checks now exercise React, Vue, and Web Component facades with both valid usage and negative assertions for invalid variants and unknown props.
- Adapter packages only claim host props that their runtimes currently support; this fix does not pretend that full native-element prop forwarding already exists.

### Default Web theme resolution

- CLI-generated Shadcn themes now follow the system light/dark preference through `prefers-color-scheme` when the application has no explicit theme.
- Root `data-theme="light"` / `data-theme="dark"` attributes and `.light` / `.dark` classes keep higher priority so applications can override the system preference.
- Style Compiler output applies the same system fallback to generated `dark:*` token CSS, preventing theme variables and component dark-mode deltas from resolving different themes.
- React, Vue, and Web Component adapters share one default Web color-scheme resolver so Prototype environment meta and generated CSS use the same initial effective theme.
- The RC Trial documentation now explains system fallback and explicit host overrides.

## Still under validation

- Meta subscription and rule reevaluation during live theme changes.
- Local light/dark scopes nested below the document root.
- Additional installation, type, runtime, CSS, accessibility, bundle, and API findings from post-publication `0.2.0-rc.1` trials will enter a later release train.
