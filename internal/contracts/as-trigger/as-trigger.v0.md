# as-trigger.v0.md

> Status: Draft - v0
>
> This document defines the minimal v0 contract for `asTrigger()`, a privileged asHook that merges event routing for directly nested trigger prototypes.

---

## 0. Positioning

`asTrigger()` is a core privileged asHook.

It is not a general event helper and is not an authored `defineAsHook(...)` product. Its job is narrow:

> merge the event route of directly and continuously nested trigger prototypes to the outermost trigger in that continuous trigger chain.

`asTrigger()` depends on:

- asHook privileged and trace semantics
- the event path
- host-cap-provided instance, parent, and prototype lookup

`asTrigger()` does not depend on:

- focus
- state interaction
- overlay
- boundary
- hit participation

---

## 1. Invocation Model

`asTrigger()` is setup-only.

It installs once for the caller prototype and records privileged trace metadata for trigger identity.

The stable trigger identity is `asTrigger`.

---

## 2. Host Relation Boundary

`asTrigger()` does not define host tree semantics.

The host must provide the information needed to answer:

- what is the current caller instance target?
- what is this target's direct logical parent target?
- what prototype belongs to that parent target?

In the current implementation, these are supplied through as-trigger host capabilities:

- `AS_TRIGGER_INSTANCE_CAP`
- `AS_TRIGGER_PARENT_CAP`
- `AS_TRIGGER_GET_PROTO_CAP`

The parent relation is a logical direct-parent relation supplied by the host. It must not be inferred by `asTrigger()` from DOM containment or another host-specific tree rule.

---

## 3. Trigger Ownership

When applied, `asTrigger()` marks the current caller target as a trigger confirmation owner.

Event routing may use this ownership marker to resolve which prototype owns activation confirmation for nested native targets.

---

## 4. Route Merge Rule

If the current trigger target has a direct parent target whose prototype trace also contains `asTrigger`, then the current trigger route is merged upward.

If that parent is also directly nested in another trigger, merging continues.

The final event route owner is the outermost trigger in the continuous direct-parent trigger chain.

---

## 5. Stop Conditions

Route merging stops when:

- the current target has no parent
- the parent target has no prototype
- the parent prototype does not have `asTrigger` trace
- the host cannot prove a direct parent relation

When merging stops immediately, the current trigger remains its own route owner.

---

## 6. Non-Goals

`asTrigger()` does not define:

- focus behavior
- disabled behavior
- click/expose event naming
- overlay trigger semantics
- boundary or outside-interaction semantics
- hit participation or pointer-event participation

Those behaviors may depend on trigger identity, but they are owned by their respective contracts.

---

## 7. Related Spec Entities

- `C-AS-TRIGGER-0001`
- `T-AS-TRIGGER-0001`
- `C-AS-HOOK-PRIVILEGED-0001`
- `C-EVENT-0001`
- `C-EVENT-TYPE-0001`
