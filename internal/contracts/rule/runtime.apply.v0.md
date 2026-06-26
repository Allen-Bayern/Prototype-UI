# rule.runtime.apply - Evaluation and Execution Boundary (v0)

> Status: Draft - implementation-aligned for `feedback.style`
>
> Rule runtime evaluates RuleIR against current observable inputs and produces an execution plan or an equivalent optimized execution. In v0, the stable default plan is `style.tokens`.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

- evaluation flow
- active rule selection
- declaration-order operation collection
- default `style.tokens` Plan
- extension and short-circuit boundary

### 0.2 Non-goals (v0)

- host-specific style application
- render scheduling
- state intent application, until implemented
- Web selector optimization details

---

## 1. Evaluation Flow

Given a set of RuleIR and current observable inputs, runtime must:

1. evaluate each rule's `when`
2. select active rules
3. preserve declaration order
4. collect intent operations
5. merge supported intent channels according to their contracts
6. produce a Plan or allow an extension to execute an equivalent optimized path

Evaluation must be deterministic for identical inputs.

---

## 2. Default Plan

The stable v0 default Plan is:

```ts
type RulePlanV0 = {
  kind: 'style.tokens';
  tokens: string[];
};
```

Rules:

- `tokens` must be semantically merged
- empty tokens mean no active style intent
- Plan is not host output
- Plan does not imply CSS, classes, attributes, or any host-specific realization

---

## 3. Executor Boundary

Rule runtime must not bypass Proto UI channels to touch the host.

The default executor may apply a style-token Plan through feedback runtime style APIs. It must not write host classes, attributes, DOM, native views, or platform objects directly.

Adapters may customize execution if they preserve the same semantic result.

---

## 4. Extension Boundary

Extensions may:

- transform RuleIR
- provide additional input readers
- adjust Plan output
- short-circuit Plan execution

If an extension short-circuits the default Plan, it assumes responsibility for equivalent execution or explicit delegation.

Short-circuit optimization must not define core rule semantics. It is downstream realization.

---

## 5. Trigger Boundary

Rule evaluation can be triggered by runtime/module wiring, such as:

- props changes
- referenced state changes
- lifecycle checkpoints
- explicit adapter/controller update paths

The exact scheduling strategy is not part of rule core as long as observable semantics are equivalent for the supported input and intent combination.

---

## 6. Related Contracts

- `rule.v0.md`
- `intent.feedback.style.v0.md`
- `when.deps.props.v0.md`
- `when.deps.state.wiring.v0.md`
- `_debt/rule.deferred-semantics.md`
