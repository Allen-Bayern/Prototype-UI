# rule.intent.feedback.style (v0)

> Status: Draft - implementation-aligned
>
> `feedback.style` is the stable v0 rule intent channel. It records visual feedback intent and lets feedback/adapters decide how that intent is realized.

---

## 0. Scope and Non-goals

### 0.1 Scope (v0)

- `i.feedback.style.use(...)`
- supported style handle boundary
- declaration-order collection
- semantic token merge
- activation and deactivation behavior

### 0.2 Non-goals (v0)

- CSS realization
- host selector compilation
- adapter scheduling
- runtime state mutation

---

## 1. Intent Shape

Rule may record style intent through:

```ts
i.feedback.style.use(...handles);
```

In v0, the stable supported handle kind is Tailwind-flavored `tw`.

Style token syntax is governed by feedback contracts. Rule must not widen the feedback style token language.

---

## 2. Collection Order

Runtime collects `feedback.style` operations from active rules in rule declaration order.

Within one rule, operation order must be preserved.

---

## 3. Merge Semantics

Collected tokens must be passed through feedback semantic merge.

This means:

- active rules contribute tokens
- inactive rules contribute no tokens
- deactivation removes the inactive rule's token contribution on the next evaluation
- conflict behavior follows feedback semantic merge, not raw last-write-wins

---

## 4. Execution Boundary

Rule does not directly touch the host.

The default runtime path may apply the merged style result through feedback runtime style APIs. Adapter or extension modules may instead produce an equivalent optimized result.

Any optimized path must preserve the same active/inactive and merge semantics.

---

## 5. Related Contracts

- `feedback/style.use.setup-only.v0.md`
- `feedback/style.merge.semantic.v0.md`
- `runtime.apply.v0.md`
