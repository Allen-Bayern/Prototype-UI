# Interaction semantic state borrowed accessors are deprecated

## Decision

`def.state.fromInteraction(...)` and `def.state.fromAccessibility(...)` returned `borrowed` state views in early v0, but this accessor model is now deprecated.

The replacement direction is protocol-owned state handles exposed through asHook results. Styled prototypes and downstream composed prototypes should consume `asButton().stateHandles`, `asSwitchRoot().stateHandles`, or the relevant protocol asHook result instead of reacquiring the same facts through `def.state.*` semantic accessors.

## Rationale

Observed projection is philosophically cleaner for system-level interaction and accessibility facts: the system would own the fact, and the prototype author would only read or observe it.

v0 does not yet have enough confidence that adapters and modules can always maintain those facts correctly for every host and every component shape. Prototype authors still need the ability to assert official semantic states such as `hovered`, `pressed`, `focused`, `disabled`, `checked`, or `selected` when they have stronger local knowledge.

That was the original reason to keep these semantic states borrowed. However, asHook result projection now gives protocol hooks a stable way to return named state handles, so the semantic accessor path is no longer the right composition surface. More importantly, concrete facts such as `checked`, `expanded`, and `invalid` need protocol-specific truth sources; the accessibility projection should consume those facts rather than own them by default.

## Debt

The deprecated implementation may remain during 0.1 to avoid forcing uncataloged prototypes through a broad migration. Because v0 minor versions do not promise compatibility, the API surface can be removed directly in the 0.2 or 0.3 line.

Long term, official interaction and accessibility state should move toward protocol-owned or system-owned projection with explicit truth-source ownership. The migration should not push authors toward private ad hoc state; it should route them through protocol asHook state handles or domain-specific privileged hooks.
