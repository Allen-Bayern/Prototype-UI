# rule.intent.compose (v0)

> Status: Draft - v0
>
> Rule intent records clear operations that can be analyzed and executed later. It is not an arbitrary callback surface and must not contain host-specific side effects.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

- IntentBuilder as an op recorder
- operation ordering
- channel independence
- extension boundary for additional intent channels

### 0.2 Non-goals (v0)

- host execution logic
- arbitrary prototype-author callbacks
- channel priority
- state intent layer semantics, until implemented

---

## 1. IntentBuilder Boundary

`IntentBuilder` exists only while compiling a setup-time rule declaration.

It must:

- record declarative operations
- preserve operation order
- avoid executing runtime effects during setup
- avoid capturing runtime-only values in RuleIR

It must not:

- call author callbacks
- touch host APIs
- mutate state directly
- apply feedback directly
- schedule rendering

---

## 2. Operation Model

Rule intent is represented as a list of operations:

```ts
type RuleIntent = {
  kind: 'ops';
  ops: RuleOp[];
};
```

Each operation belongs to an intent channel, such as `feedback.style`.

Multiple operations may be recorded by one rule. Their order must be preserved.

---

## 3. Channel Independence

Each intent channel defines its own merge and execution semantics.

Rule core does not define:

- cross-channel priority
- implicit conflict resolution between channels
- host-specific side effects

Runtime collects active rule operations in declaration order, then delegates channel behavior to the corresponding intent contract or extension.

---

## 4. Extension Boundary

Adding a new intent channel is a normal extension of rule.

A new intent channel must define:

- builder shape
- serializable RuleIR representation
- allowed target handles or values
- merge semantics
- activation and deactivation behavior
- execution boundary

---

## 5. Related Contracts

- `rule.v0.md`
- `intent.feedback.style.v0.md`
- `intent.state.v0.md`
- `runtime.apply.v0.md`
