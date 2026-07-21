# Proto UI 0.2.0-rc.2

> Unpublished draft. This candidate continues collecting findings from external `0.2.0-rc.1` trials; its complete release train has not opened yet, so current installation and trial instructions must remain pinned to the published `0.2.0-rc.1`.

## Fixed

### Prop removal restores defaults

- Props resolution now treats `missing` as the host withdrawing that input. When a valid provided value becomes an omitted key, resolution no longer retains the withdrawn value through `prevValid`; it returns to `setDefaults`, declaration `default`, or canonical `null`.
- `prevValid` remains available when a key is still provided but its current value is empty or invalid, keeping invalid-input recovery separate from prop-removal semantics.
- React, Vue, and Web Component hosts share this behavior through the Props Kernel without adapter-specific exceptions.
- Removing `disabled` from a React Shadcn Button restores the enabled state, while removing `variant` or `size` restores the corresponding default tokens.
- Cross-adapter resolved-snapshot conformance, Base Button behavior tests, and Shadcn Button visual-token tests cover provided-to-missing transitions.

## Still under validation

- Additional installation, runtime, CSS, accessibility, bundle, and API findings from post-publication `0.2.0-rc.1` trials.
- The complete `0.2.0-rc.2` release train will prepare its version entity, package versions, BOM, spec snapshot, and publication gates after the trial findings are collected together.
