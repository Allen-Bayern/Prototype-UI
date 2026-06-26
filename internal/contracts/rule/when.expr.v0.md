# rule.when - Condition Expression Contract (v0)

> Status: Draft - v0
>
> `when` is the pure condition language of rule. It observes values supplied by other modules and produces a boolean result. It must not execute side effects.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

- condition expression AST
- dependency-producing value inputs
- strict equality semantics
- logical operators
- purity constraints

### 0.2 Non-goals (v0)

- runtime scheduling
- host event matching
- deep comparison
- custom comparators
- host-environment abstraction naming
- context path access

---

## 1. Expression Shape

Core v0 supports the following expression forms:

```ts
type WhenExpr<Props> =
  | { type: 'true' }
  | { type: 'false' }
  | { type: 'eq'; left: WhenValue<Props>; right: WhenLiteral }
  | { type: 'not'; expr: WhenExpr<Props> }
  | { type: 'all'; exprs: WhenExpr<Props>[] }
  | { type: 'any'; exprs: WhenExpr<Props>[] };
```

```ts
type WhenLiteral = string | number | boolean | null;
```

---

## 2. Value Inputs

Rule core does not create observable inputs.

`WhenValue` entries are introduced by rule input surfaces backed by other modules, such as:

- props
- state
- context

Each input surface must define:

- how the value is identified in RuleIR
- how dependencies are recorded
- how the current value is read during evaluation
- what re-evaluation triggers are required

Host-environment inputs currently implemented as `meta` are treated as secondary rule scope and are not part of rule core naming.

---

## 3. Equality

`eq` uses JavaScript strict equality (`===`) in v0.

Rules:

- no deep comparison
- no custom comparator
- no coercion

---

## 4. Logical Operators

`not(expr)` returns the boolean negation of `expr`.

`all(...exprs)`:

- returns true when every expression is true
- returns true for an empty input list

`any(...exprs)`:

- returns true when at least one expression is true
- returns false for an empty input list

---

## 5. Events and Reversibility

Rule does not match instantaneous event occurrences.

Invalid core shape:

```ts
when(event.happens);
```

If interaction should drive a rule, it must first be represented as a state-shaped value, such as pressed, hovered, focused, or another explicit state machine.

---

## 6. Purity

Evaluation must be pure.

During `when` evaluation:

- no state writes
- no feedback writes
- no context updates
- no event subscriptions
- no host operations

Identical input values must produce identical boolean results.

---

## 7. Related Contracts

- `rule.v0.md`
- `when.deps.props.v0.md`
- `when.deps.state.v0.md`
- `when.deps.context.v0.md`
