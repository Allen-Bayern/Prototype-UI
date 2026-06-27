# asHook privileged no-arg migration fracture

Date: 2026-06-27

## Context

普通 authored asHook 已经收口到无参数 caller 与 first-call-wins 语义，并由 `D-AS-HOOK-NO-ARG-ONCE-0001`、`C-AS-HOOK-0003`、`C-AS-HOOK-0004` 记录。这个收口暴露出另一个断口：现有特权 asHook 中仍有一批 API 使用 patch/options 参数或 configurable 重复调用策略。

同时，`asCollection` / `asCollectionItem` 已经改名为 `useCollection` / `useCollectionItem` 并暂时落在 `defineHook`，但早期记录明确把 collection structural projection 视为 privileged 能力。这个迁移不能被理解为最终归类，只是为了避免它继续被普通 `defineAsHook(...)` 契约误读。

## Fracture Status

- id: `F-AS-HOOK-PRIVILEGED-NO-ARG-MIGRATION`
- status: `open`
- specDecision: `D-AS-HOOK-PRIVILEGED-NO-ARG-MIGRATION-0001`
- affectedNextStage: `as-hook`
- action: `carry-to-next-asHook-pass`
- blocksRuleTypeCleanup: `false`

当前 fracture 模型使用 `open` / `resolved` / `obsolete` / `merged` / `deferred` 等状态，没有一等 `doing` 状态。进行中的工作应记录在本文件的 progress / next checkpoints 中；如果后续需要更细颗粒度，可以拆出子 fracture 记录。

## Current Facts

- `asTrigger()` 已经是无参数 privileged asHook。
- `defineAsHook(...)` authored caller 已经是无参数 caller。
- 基于 prototype spec 声明的 authored asHook 通常天然无参数。
- `asFocusable()` 已迁移为无参数 caller；setup-time 配置通过返回的 `FocusableHandle.configure(...)` 完成。
- `asOverlay(patch)`、`asFocusScope(patch)`、`asFocusGroup(patch)`、`asBoundary(patch)`、`asHitParticipation(...)`、`asTransition(options)` 仍带参数化或 configurable 行为。
- `useCollection(options)` / `useCollectionItem(options)` 当前通过 `defineHook` 实现，但它们仍消费 anatomy ports，不能简单归入普通作者函数。

## Progress

- Done: ordinary `defineAsHook(...)` caller shape is no-arg.
- Done: ordinary authored asHook repeat semantics are first-call-wins with result reuse.
- Done: use-style helpers have been renamed away from `asXxx` to reduce caller-shape ambiguity.
- Recorded: privileged no-arg migration direction now has spec entity `D-AS-HOOK-PRIVILEGED-NO-ARG-MIGRATION-0001`.
- Done: `asFocusable` caller shape migrated to no-arg; focusable configuration now goes through the returned handle.
- Done: focus-owned `focused` / `focusVisible` facts moved out of state-interaction runtime wiring ownership, returned as state-backed observed handles, and recorded by `D-FOCUS-STATE-INTERACTION-BOUNDARY-0001`.
- Open: parameterized privileged hooks still need API-by-API migration plans.
- Open: `useCollection` / `useCollectionItem` need a final classification.
- Open: returned configuration APIs need concrete contracts and tests before replacing existing patch/options parameters.

## Next Checkpoints

1. For each parameterized privileged asHook, decide whether it can become a no-arg caller directly or needs a returned configuration API first.
2. For hooks that need returned configuration APIs, define setup-only methods, merge rules, conflict diagnostics, return-value reuse rules, and type tests.
3. Decide whether collection structural projection is a privileged asHook, a governed use-style hook, or an internal ordinary function.
4. Update the corresponding privileged hook contracts and runtime/type tests before removing existing patch/options caller parameters.

## Notes

This record is intentionally not the normative source. The normative decision entry is `spec/decisions/D-AS-HOOK-PRIVILEGED-NO-ARG-MIGRATION-0001.yaml`; this record tracks execution progress and the practical fracture inventory.
