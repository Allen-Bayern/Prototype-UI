# Module resource ownership

This document is the human-readable projection of the lifecycle resource audit. The machine-enforced declaration is `ModuleDef.resourceOwnership`; lifecycle behavior remains governed by `C-LIFECYCLE-0002`, `C-LIFECYCLE-0006`, and `C-LIFECYCLE-0007`.

## Ownership classes

- `instance`: logical data belongs to the Proto instance, survives every detach, and is released only by terminal disposal.
- `view`: all meaningful resources belong to one mount epoch. No current module is purely view-owned because modules themselves are instance-scoped.
- `mixed`: logical configuration survives, while host listeners, projections, observers, locks, or DOM bindings suspend on detach and rebind on mount.

Host capability objects may remain readable in a caps vault while detached. Their presence does not authorize host effects: mixed modules must gate activation by `MountPhase`, and stale commit acknowledgements must not reactivate them.

## Audited matrix

| Module | Ownership | Survives detach | Epoch-bound resources |
| --- | --- | --- | --- |
| `as-trigger` | instance | logical trigger ownership and redirect declaration | realized through Event binding |
| `rule` | mixed | rule IR and extensions | state watches and runtime style contribution |
| `rule-meta` | mixed | metadata extension | host metadata getter use during active evaluation |
| `feedback` | mixed | style recorder, patch, suppression state | EffectsPort flush requests |
| `props` | instance | declarations, snapshots, watchers, raw source subscription | none |
| `event` | mixed | event registrations and redirect intent | root/global listeners and dispatch binding |
| `expose` | instance | exposed values and methods | none |
| `anatomy` | mixed | claims, domain membership, logical ordering | DOM order observer |
| `expose-state` | instance | external state handles, subscriptions, and owner-level publication | none |
| `expose-state-web` | mixed | state-to-web mapping metadata | DOM attributes, CSS variables, state subscriptions |
| `rule-expose-state-web` | mixed | optimized rule candidates | host-native variant/style realization |
| `state` | instance | state slots, values, watchers | none |
| `state-interaction` | instance | semantic interaction state declarations | none |
| `state-accessibility` | instance | semantic accessibility state declarations | none |
| `a11y` | mixed | semantic IR | projector and projection state watches |
| `collection` | instance | collection/item configuration and logical subscriptions | none |
| `context` | instance | providers, subscriptions, pending logical callbacks | none |
| `focus` | mixed | focus configuration and logical tokens | focus-center participation and DOM focus targets |
| `boundary` | mixed | config, regions, outside subscribers | active stack and host classification bridge |
| `hit-participation` | mixed | config and registered regions | host hit-participation bridge |
| `overlay` | mixed | open state, config, registrations | portal mount, layer attachment, modal lock |
| `presence` | mixed | intent, phase, callbacks | structural host bridge and pending transition |
| `test-sys` | instance | diagnostic trace state | optional host probe only |

## Required symmetry

For every mixed module:

1. setup and detached updates may mutate logical state but must not produce host effects;
2. active commit or mounted phase realizes the latest logical snapshot;
3. unmounting/detached removes listeners, projections, observers, locks, and active host participation;
4. a later mount rebinds to the current view root without recreating logical state;
5. terminal disposal additionally removes logical registrations, subscriptions, and handles.

Runtime transition tests cover stale commit invalidation, and `lifecycle.module-resources.v1.contract.test.ts` covers representative Feedback, A11y, ExposeState, and HitParticipation suspend/resume behavior. Module-specific contract suites remain responsible for their detailed host effects.
