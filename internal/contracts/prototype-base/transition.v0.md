# Base Transition v0

> Status: Draft — human-readable projection. The normative source is `spec/contracts/C-AS-TRANSITION-0001.yaml`.

## Purpose

`asTransition()` governs a component's **perceptual transition state** and coordinates that state with lifecycle ViewIntent. It does not create a second mount lifecycle and it does not expose an adapter-specific animation engine.

Three facts must remain distinct:

- `transitionState`: perceptual phase (`closed`, `entering`, `entered`, `leaving`)
- ViewIntent: whether a host view is desired
- lifecycle phase: whether the current view epoch is mounted

Consequently, `closed` does not itself prove that no host view exists, and `isPresent` is not a structural mount flag.

## Authoring surface

```ts
const transition = asTransition();
```

`asTransition` is a privileged, no-argument, once hook. Repeated calls in one prototype setup chain skip installation and return the exact same handle.

The returned handle contains:

- `transitionState`
- `isPresent`
- `controls.enter()`
- `controls.leave()`
- `controls.complete()`

The hook declares these props:

| Prop            | Default      | Meaning                                            |
| --------------- | ------------ | -------------------------------------------------- |
| `open`          | not provided | controlled target when provided                    |
| `defaultOpen`   | `false`      | initial uncontrolled target                        |
| `appear`        | `false`      | whether an initially open view enters perceptually |
| `enterDuration` | `300`        | enter fallback duration in milliseconds            |
| `leaveDuration` | `200`        | leave fallback duration in milliseconds            |
| `interrupt`     | `reverse`    | `reverse`, `wait`, or `immediate`                  |

The component exposes the two states, the three methods, the grouped `controls` value, and `beforeEnter`, `afterEnter`, `beforeLeave`, `afterLeave` events.

## State and view sequencing

### Initial closed

Setup and `created` complete while ViewIntent is set to detached. No first view epoch is required.

### Initial open

- `appear=false`: ViewIntent is present and state begins at `entered`.
- `appear=true`: ViewIntent becomes present first. The state changes from `closed` to `entering` only after the view epoch reports `mounted`.

### Enter from closed

1. Set ViewIntent to present.
2. Wait for a mounted view epoch when one does not exist.
3. Emit `beforeEnter` and enter `entering`.
4. Complete manually or after `enterDuration`.
5. Enter `entered` and emit `afterEnter`.

This ordering prevents partially initialized or unstyled DOM from becoming visible before the adapter's reveal barrier has completed.

### Leave from entered

1. Emit `beforeLeave` and enter `leaving` while retaining the current view.
2. Complete manually or after `leaveDuration`.
3. Enter `closed` and emit `afterLeave`.
4. Set ViewIntent to detached; the adapter may release the current view epoch.

The Proto instance and its exposes remain alive while detached. A later enter may create a fresh host view epoch without rerunning prototype setup.

## Delay and completion

Fallback completion uses Core `delay()`, not browser timers or frame APIs. The host supplies delayed scheduling. RuntimeSession owns pending tasks, runs their callbacks with runtime callback authority, and cancels them on unmount or dispose. `complete()` cancels the pending fallback and completes the current phase immediately.

Stale delayed callbacks must never complete a newer phase after interruption, remount, or disposal.

## Interruption

- `reverse`: cancel the current fallback and start the opposite phase on the retained view.
- `wait`: retain only the latest opposite target and consume it when the current phase completes.
- `immediate`: complete the current phase synchronously, then begin the latest target phase.

Rapid input is latest-intent governed; it must not behave as an unbounded FIFO.

## Boundaries

Transition does not define physics animation, layout/shared-element motion, staggering, child coordination, or host event detection. A host or higher-level capability may call `complete()` when native animation finishes; duration is the portable fallback.

The legacy Presence host bridge is not a structural authority for Transition. Structural materialization is governed exclusively through `run.lifecycle.setPresent()` and ViewIntent reconciliation.
