## CONTRACT_DEBT(v0): rule.deferred-semantics

### Problem

Rule has a stable core direction, but several old draft semantics are ahead of the current implementation or still under naming/design discussion.

These items must not be treated as current rule-core conformance until they are implemented, tested, and promoted into active contracts.

---

### D-RULE-STATE-INTENT-0001: `intent.state` layer semantics are not implemented

Old drafts describe `i.state(handle).be(value)` with:

- writable view constraints
- per-state layer stacks
- rule deactivation rollback
- fallback to latest non-rule baseline
- at-most-once set per evaluation
- rule-shaped write reasons

Current implementation records `state.set` ops but does not apply the full semantics.

Acceptance criteria:

1. Runtime implements layer merge and rollback.
2. Runtime tracks non-rule baseline values.
3. Runtime writes each target state at most once per evaluation.
4. Rule-driven writes carry distinguishable reasons.
5. Contract tests cover owned, borrowed, and observed target constraints.

---

### D-RULE-CONTEXT-PATH-0001: context static path access is not implemented

Old drafts describe context path access:

```ts
w.ctx(key).path('a', 'b');
```

Current implementation supports only whole-value context dependency through `w.ctx(key)`.

Acceptance criteria:

1. Builder API for static path access exists.
2. RuleIR records path as serializable string array.
3. Evaluation traverses only plain JSON objects.
4. Missing path segments resolve to `null` without throwing.
5. Tests cover missing provider, invalid path, and valid path cases.

---

### D-RULE-META-NAMING-0001: host-environment input naming is unstable

`module-rule-meta` currently provides `w.meta(key)` through host-provided metadata.

This is useful but not yet stable as rule core. Future design may replace "meta" with a more systematic host environment/configuration abstraction.

Acceptance criteria:

1. Decide whether host-environment inputs belong to rule core or a secondary rule module.
2. Decide the stable naming.
3. Define capability/provider ownership.
4. Add tests that distinguish host environment inputs from props/state/context.

---

### D-RULE-HANDLE-DISPOSE-0001: `RuleHandle.dispose()` conflicts with setup-only removal boundary

Rule declaration is setup-only. A setup-only API may return a removal function for setup composition, but that removal action should not become a runtime escape hatch unless a separate runtime API is specified.

Current `RuleHandle.dispose()` can be called after setup and is covered by existing smoke behavior.

Acceptance criteria:

1. Decide whether rule removal is setup-only or a formal runtime API.
2. If setup-only, enforce phase guard on removal.
3. If runtime, define runtime rule removal semantics separately.
4. Update tests and docs accordingly.

---

### D-RULE-IR-SERIALIZABLE-0001: RuleIR must not retain live handles

RuleIR must be fully serializable in principle.

Current implementation can retain live handles in some intent operations, especially deferred state intent paths.

Acceptance criteria:

1. RuleIR contains only serializable identities and values.
2. Live handles are retained only in runtime implementation side tables, not in RuleIR.
3. Exported IR can be string-serialized without losing normative meaning.
4. Tests reject or detect non-serializable IR contents.
