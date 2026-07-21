# Proto UI 0.2.0-rc.1 (Unreleased Draft)

> This file collects candidate changes while external `0.2.0-rc.0` trials continue. It does not mean that the `0.2.0-rc.1` release train has been created or published. `VERSION`, public package manifests, and the V entity remain on `0.2.0-rc.0`. Formal release preparation must still add a draft V entity, project the global exact version, generate the package BOM and spec snapshot, and pass the complete release checks.

## Fixed

### Default Web theme resolution

- CLI-generated Shadcn themes now follow the system light/dark preference through `prefers-color-scheme` when the application has no explicit theme.
- Root `data-theme="light"` / `data-theme="dark"` attributes and `.light` / `.dark` classes keep higher priority so applications can override the system preference.
- Style Compiler output applies the same system fallback to generated `dark:*` token CSS, preventing theme variables and component dark-mode deltas from resolving different themes.
- React, Vue, and Web Component adapters share one default Web color-scheme resolver so Prototype environment meta and generated CSS use the same initial effective theme.
- The RC Trial documentation now explains system fallback and explicit host overrides.

## Still under validation

- Meta subscription and rule reevaluation during live theme changes.
- Local light/dark scopes nested below the document root.
- Additional installation, type, runtime, CSS, accessibility, bundle, and API findings from continued external `0.2.0-rc.0` trials.
