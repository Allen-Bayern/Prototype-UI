# rule.when.deps.context.wiring (v0)

> Status: Draft - partial implementation
>
> This contract defines the minimal runtime wiring expectation for rule context dependencies. Context is resolved at evaluation time; v0 does not require context-change notifications or polling.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

- evaluation-time context reads
- missing-provider resilience
- interaction with other re-evaluation triggers

### 0.2 Non-goals (v0)

- provider relocation notifications
- context value equality tracking
- context polling
- context path validation
- context mutation through rule

---

## 1. Evaluation-time Read

When a rule that depends on context is evaluated, runtime must read the context value for the referenced key at that moment.

If no provider is available, the rule input must resolve to `null` or an equivalent non-match value. Evaluation must continue.

---

## 2. Trigger Boundary

Context dependency by itself does not require a stable update cycle.

Runtime must not rely on implicit polling for correctness.

If a rule also depends on another reactive input, such as state or props, those inputs may trigger re-evaluation. During that re-evaluation, the context input is read again.

---

## 3. Phase Boundary

Rule evaluation is a runtime activity.

Setup must only record the context dependency; it must not evaluate context-dependent rules.

---

## 4. Diagnostics

Implementations may warn when:

- a context-dependent rule repeatedly sees no provider
- context dependency is present but no context module is installed

Diagnostics must not alter rule evaluation semantics.

---

## 5. Related Contracts

- `when.deps.context.v0.md`
- `context/with-tree.v0.md`
