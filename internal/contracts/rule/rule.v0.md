# Rule Core Contract (v0)

> Status: Draft - v0
>
> Rule is Proto UI's declarative syntax for expressing **when a condition holds, emit a clear intent**. Rule is not an information channel. It depends on other modules for inputs and intent execution, and its value is preserving author intent in a form that adapters and future compilers can analyze.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

This contract defines the core positioning of rule:

- rule is a declarative condition-to-intent syntax
- rule is not one of Proto UI's information channels
- rule is optional but recommended when it can express the behavior clearly
- rule declarations compile to serializable RuleIR
- rule extension modules may add when inputs, intent channels, or optimized execution paths

### 0.2 Non-goals (v0)

This contract does not define:

- individual when input semantics
- individual intent channel semantics
- host-specific realization
- Web selector optimization details
- arbitrary callback or side-effect execution

---

## 1. Contract Entities

### C-RULE-0001: Rule is not an information channel

Rule does not carry information between actors.

It is not:

- App Maker -> Component configuration (`props`)
- Component -> User feedback (`feedback`)
- User -> Component interaction input (`event`)
- Component -> App Maker output (`expose`)
- Component <-> Component communication (`context`)

Rule expresses a declarative relationship:

> when observable conditions hold, produce specified intent.

The inputs observed by `when` and the effects produced by `intent` belong to other modules.

### C-RULE-0002: Rule is optional but recommended when expressive enough

Removing rule must not make other prototype syntax inexpressive. Prototype authors can usually express the same behavior with callbacks, state, feedback, props, or other APIs.

When a behavior can be expressed clearly through rule, rule is the recommended practice because it preserves intent in an analyzable form. That form allows adapters to find optimization paths that would otherwise require compiler-grade static analysis.

Rule's expressiveness is intentionally limited. It should be used for clear, state-shaped condition-to-intent logic, not for arbitrary history-dependent or host-specific behavior.

### C-RULE-0003: RuleIR must be serializable

The intermediate representation produced by rule must be fully serializable in principle.

RuleIR must not contain:

- functions
- host objects
- runtime closures
- opaque runtime handles
- adapter-specific objects

In practice, a valid RuleIR should be representable as a string-serializable data structure. Any implementation path that retains live handles inside RuleIR is implementation debt unless the handle has first been reduced to a serializable identity.

### C-RULE-0004: `def.rule` is setup-only

`def.rule(spec)` is a setup-phase declaration API.

Rules:

- a prototype may declare rules only during setup
- runtime code must not create new rules
- `RuleSpec` must contain a `when` declaration and an `intent` declaration
- `when` and `intent` must record declarative data, not execute runtime logic

Calling `def.rule` outside setup must fail through the exec-phase guard or an equivalent phase violation.

### C-RULE-0005: setup-time removal must not become runtime removal

If a setup-only API returns a removal or undo function, that function must remain setup-only unless a separate runtime API explicitly defines otherwise.

This keeps setup composition tools from becoming hidden runtime escape hatches.

For rule, this means a rule removal handle, if provided as part of setup composition, must not be usable from runtime callbacks unless a dedicated runtime rule API is introduced and specified separately.

---

## 2. Extension Model

Rule intentionally depends on other modules.

Adding a new `when` input or a new `intent` target is a normal reason to create a patch module around `module-rule`.

Examples:

- a host-environment input module may add environment-shaped `when` inputs
- a feedback-related module may add a new analyzable intent channel
- an adapter-specific optimization module may short-circuit the default execution path

These modules must not weaken the serializable RuleIR boundary.

---

## 3. Optimization Boundary

Rule enables adapter and compiler optimization by making intent explicit.

Optimizations may:

- transform RuleIR
- short-circuit the default plan
- translate rule intent into host-native mechanisms
- avoid runtime work when equivalent host behavior can be produced

Optimizations must not define rule core semantics. They are downstream consequences of rule's analyzable syntax.

The Web exposed-state selector optimization is an example of rule's potential, not a design constraint for rule core.

---

## 4. Related Contracts

- `define.setup-only.v0.md`
- `when.expr.v0.md`
- `when.deps.props.v0.md`
- `when.deps.state.v0.md`
- `intent.compose.v0.md`
- `intent.feedback.style.v0.md`
- `runtime.apply.v0.md`
- `_debt/rule.deferred-semantics.md`
