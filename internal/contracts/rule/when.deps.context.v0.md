# rule.when.deps.context (v0)

> Status: Draft - partial implementation
>
> This contract defines context as a rule `when` input. Current implementation supports whole-value context reads through `w.ctx(key)`. Static path access is planned but not implemented and must be treated as debt.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

- context dependency recording
- whole context value reads
- missing-provider fallback behavior during evaluation
- readonly input boundary

### 0.2 Non-goals (v0)

- context provider resolution semantics
- context update semantics
- context mutation through rule
- static path access, until implemented
- context-driven scheduling guarantees

---

## 1. Dependency Form

`when` may depend on a context key:

```ts
w.ctx(key);
```

The dependency record must include the context key identity.

Rule observes the current resolved context value for that key. It does not provide context values and does not update them.

---

## 2. Value Semantics

Context values are owned by the context channel.

For rule evaluation:

- a resolved context value is treated as readonly
- a missing provider resolves as `null` or an equivalent non-match value
- evaluation must not throw only because the provider is absent

Context value constraints are defined by the context contract. Rule does not widen the context value domain.

---

## 3. Path Access Debt

Older drafts describe static path access, such as:

```ts
w.ctx(key).path('a', 'b');
```

That API is not implemented in the current rule builder and is not part of the stable v0 core.

If path access is introduced later, it must specify:

- a serializable path representation
- readonly traversal behavior
- failure semantics for missing or non-object path segments
- dependency identity and diagnostics

This is tracked in `_debt/rule.deferred-semantics.md`.

---

## 4. Re-evaluation

Context dependency does not currently imply context-change notifications.

When rule is evaluated for another reason, it must read the current context value at that time.

Context-driven scheduling, provider relocation detection, and polling are not part of v0 core.

---

## 5. Related Contracts

- `context/with-tree.v0.md`
- `when.deps.context.wiring.v0.md`
- `_debt/rule.deferred-semantics.md`
