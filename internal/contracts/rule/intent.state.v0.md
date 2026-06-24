# rule.intent.state (v0)

> Status: Deferred - design debt
>
> This document preserves the intended direction for rule-driven state intent. It is not yet an implementation-aligned v0 contract. The current runtime records `state.set` operations but does not implement the full layer, rollback, and baseline semantics described here.

---

## 0. Deferred Scope

Rule state intent is intended to express controlled state mutation:

```ts
i.state(handle).be(value);
```

However, stable v0 behavior still needs implementation and test coverage.

This deferred contract must not be cited as current conformance until the debt is closed.

---

## 1. Intended Writable View Constraint

State intent should only target writable state views.

Expected direction:

- owned views may be writable
- borrowed views may be writable when state contract allows it
- observed views must not be writable

The state contract defines writability. Rule must not grant extra write permission.

---

## 2. Intended Layer Model

For a given state, rule intent is expected to merge through a layer stack:

- each active rule contributes at most one layer per state
- later declarations have higher priority
- deactivation removes only that rule's layer
- if no rule layer remains, the state falls back to its latest non-rule baseline

This is not implemented in the current runtime.

---

## 3. Intended Application Boundary

The intended runtime behavior is:

- compute merged target per state before writing
- set each state at most once per evaluation
- skip set when target equals current value
- include a rule-shaped reason for diagnostics and baseline tracking

This is not implemented in the current runtime.

---

## 4. Debt

Tracked by:

- `_debt/rule.deferred-semantics.md`

Acceptance requires:

- executable tests for layer merge and rollback
- baseline tracking for non-rule state writes
- phase-safe rule state writes
- serializable RuleIR identity for state targets
