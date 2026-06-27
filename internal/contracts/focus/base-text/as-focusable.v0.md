# as-focusable.v0.md

> Status: Draft - v0
>
> This document defines the v0 contract for `asFocusable()`.

---

## 0. Positioning

`asFocusable()` declares that the current prototype instance participates as a **focus node**.

It is responsible for:

- registering the current instance as a focusable node
- receiving system-owned focus facts
- providing minimal focus commands
- optionally joining a focus scope

It is **not** responsible for:

- choosing the next/previous focus target
- trap/restore policy
- scope-wide navigation

---

## 1. Invocation Model

`asFocusable()` is a privileged, no-arg, singleton-install asHook.

- the first call installs the focusable capability
- later calls must reuse the same underlying handle
- setup-time configuration must go through the returned handle
- repeated calls must not reinstall the focusable capability

---

## 2. Setup-Time Configuration

`asFocusable()` accepts no initialization parameter.

v0 intent:

- `asFocusable()` with no arguments declares default focusable participation
- fields that need refinement must be configured through `handle.configure(...)`
- privileged asHook caller shape must not reintroduce parameter patches

Setup-configurable fields include:

- `scopeKey`
- `autoFocus`
- `disabled`
- `navParticipation`
- `meta`

Any field that must become init-required in the future must be represented by a distinct privileged asHook contract, not by adding parameters back to `asFocusable()`.

---

## 3. Scope Membership

Scope membership is explicit by default.

- a focusable joins a focus scope through a token-style `scopeKey`
- `scopeKey` is a structural membership token, not an arbitrary query id

If no `scopeKey` is provided:

- runtime may apply fallback local behavior
- but such fallback is non-structural
- composite widget semantics must not rely on it

---

## 4. Return Handle

`asFocusable()` should return a `FocusableHandle`-like object.

Its v0 surface should minimally allow:

- reading state-backed focus facts
- issuing focus requests
- setup-only configuration refinement

Example shape:

```ts
type FocusableHandle = {
  focused: ObservedStateHandle<boolean, any>;
  focusVisible: ObservedStateHandle<boolean, any>;
  focusable: ObservedStateHandle<boolean, any>;

  focus(options?: FocusRequestOptions): void;
  blur(): void;
  isFocused(): boolean;

  configure(patch: FocusableConfigPatch): void;
};
```

`configure(...)` must be setup-only.

The focus fact handles returned by `asFocusable()` must be standard state-shaped handles backed by the State module metadata. They are observed, not author-owned: callers may read and watch them, and rule/expose systems may consume them as state handles, but prototype authors must not receive direct write authority for these facts.

---

## 5. Repeated Configuration

When `asFocusable()` is called multiple times in setup:

- installation must remain singleton-like
- setup-time configuration through the returned handle may be merged deterministically
- later compatible fields may override earlier compatible fields
- unsafe conflicts must throw, or at minimum emit a clear warning

v0 should prefer explicit returned-handle configuration over repeated side-effectful installation.

---

## 6. Projection Boundary

`asFocusable()` may expose or project to:

- focus-owned state such as `focused` and `focusVisible`
- outward expose methods such as `focus()`

But the hook itself is the primary authoring boundary for focus-node semantics.

Compatibility projections to legacy interaction state slots may exist during migration, but `state-interaction` is not the owner of focus facts.

---

## 7. Non-Goals

v0 does not require `asFocusable()` to expose:

- arbitrary member lookup
- next/prev navigation
- scope registry internals
- implementation-specific host objects
