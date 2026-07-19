# 2026-06-26 Core Compaction 断口盘点（Pass 1）

> Internal record. Not normative. 本文是 Core Compaction Pass 0.1 的第一轮断口盘点，目标是为 `BaseButton / asButton` 与 `asTrigger` 的 Prototype Cataloging Pilot 找出真实阻塞项。本文不关闭任何契约，也不直接替代正式决策实体。

---

## 1）范围

本轮只盘点会影响下一阶段原型编目的断口，尤其是：

- `BaseButton / asButton`
- `asTrigger`
- 两者依赖的核心契约：asHook、event、expose event、focus、state interaction、exec-phase、host caps

本轮不追求清零全部 open fracture。对不阻塞试点的真实问题，允许标记为 `deferred`。

---

## 2）状态模型

```ts
type FractureStatus = 'open' | 'resolved' | 'obsolete' | 'merged' | 'deferred';
```

```ts
type FractureAction =
  | 'close'
  | 'merge'
  | 'defer'
  | 'decide-now'
  | 'carry-to-prototype-stage'
  | 'carry-to-next-asHook-pass';
```

---

## 3）来源

本轮候选断口来自：

- `internal/contracts/_debt/*`
- `internal/contracts/DEBT.v0.md`
- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`
- `internal/records/2026-06-26-core-compaction-pass-0.1.zh-CN.md`
- `BaseButton / asButton` 与 `asTrigger` 相关实现、契约和测试

`internal/contracts/DEBT.v0.md` 当前为空，不产生独立断口。

---

## 4）摘要

| id | title | status | blocks pilot | affected next stage | action |
| --- | --- | --- | --- | --- | --- |
| F-001 | Rule `intent.state` layer semantics 未实现 | deferred | no | none | defer |
| F-002 | Rule context static path access 未实现 | deferred | no | none | defer |
| F-003 | Rule host-environment/meta 命名不稳定 | deferred | no | none | defer |
| F-004 | `RuleHandle.dispose()` 与 setup-only removal 边界冲突 | deferred | no | as-hook | defer |
| F-005 | RuleIR 仍可能保留 live handles | deferred | no | none | defer |
| F-006 | Feedback runtime flush lifecycle 未正式化 | deferred | no | adapter | defer |
| F-007 | Web style ownership contract 未正式化 | deferred | no | adapter | defer |
| F-008 | exec-phase 术语锚点未统一 | open | no | as-hook | carry-to-prototype-stage |
| F-009 | `module` 实体 schema 未定 | deferred | no | none | defer |
| F-010 | `host-cap` 实体 schema 未定 | deferred | no | adapter | defer |
| F-011 | `adapter profile` 实体预留策略未定 | deferred | no | adapter | defer |
| F-012 | `prototype` 实体命名、编号与继承关系未定 | resolved | no | none | close |
| F-013 | focus/overlay/hit/boundary 与 asHook scope 总问题过宽 | merged | no | none | merge |
| F-014 | focus 是核心能力、privileged asHook 还是 adapter expectation | resolved | no | none | close |
| F-015 | overlay/hit/boundary 与 privileged asHook 的关系图未定 | deferred | no | none | defer |
| F-016 | 旧契约文档归档目录与迁移策略未定 | deferred | no | none | defer |
| F-017 | asHook name / trace identity 规则与实现不一致 | resolved | no | as-hook | carry-to-prototype-stage |
| F-018 | parameterized/configurable asHook 已实现但文档仍标 proposed | open | no | as-hook | carry-to-next-asHook-pass |
| F-019 | `asTrigger` 缺少独立契约归属与实体边界 | resolved | no | as-hook | carry-to-prototype-stage |
| F-020 | `disabled` 行为的所有权边界未压实 | resolved | no | none | close |
| F-021 | interaction signal 集合与 `fromInteraction` 投影未完全同步 | deferred | no | base-prototype | defer |
| F-022 | expose event `click` 与 native/proto event 的边界需明确 | resolved | no | none | close |

Pilot 阻塞项（2026-07-02 更新后）：

```text
当前没有仍阻塞 BaseButton/asButton 与 asTrigger 常见使用路径的已知断口。
F-018、F-021 仍保留后续治理问题，但不再阻塞本轮 pilot。
```

本轮已处理或进入落地的项（2026-07-02 更新）：

```text
F-012 已由 D-PROTOTYPE-ENTITY-NAMING-0001 与 P-BASE-BUTTON 试点落地覆盖。
F-014 已由 focus domain / asFocusable / asFocusScope / asFocusRoving 契约与实现修复覆盖；roving 细节进入后续列表类原型阶段。
F-017 已由 D-AS-HOOK-CALLER-NAME-0001 覆盖，剩余工作是文档/tooling 落地。
F-019 已由 C-AS-TRIGGER-0001 与 T-AS-TRIGGER-0001 覆盖。
F-020 已在 P-BASE-BUTTON / asButton 实现中收口为 Button 自治协调 disabled prop、state、focus eligibility 与 activation gate。
F-021 中 focus facts 越权归属问题已由 D-FOCUS-STATE-INTERACTION-BOUNDARY-0001 解决；通用 interaction signal 集合同步延期。
F-022 已在 P-BASE-BUTTON 中明确：Button 的 `click` 是 protocol outward signal，不等同 native click 或 `press.commit`。
```

---

## 5）逐项分析

### F-001：Rule `intent.state` layer semantics 未实现

来源：

- `internal/contracts/_debt/rule.deferred-semantics.md`
- `internal/contracts/rule/intent.state.v0.md`

当前事实：

- 旧草案描述了 `i.state(handle).be(value)` 的 layer stack、rollback、baseline 与 at-most-once 写入语义。
- 当前实现只记录部分 `state.set` intent，不具备完整 layer merge 与 rollback 语义。
- `BaseButton / asButton` 目前没有使用 rule state intent。
- `asTrigger` 不依赖 rule。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可以成为 rule runtime hardening issue。
- 不适合作为 Prototype Cataloging Pilot 的前置 issue。

Decision 潜力：

- 需要未来决定 `intent.state` 是否进入 rule core，还是作为后续 rule extension。

分析：

这是一个真实断口，但不阻塞 `BaseButton/asButton` 或 `asTrigger`。如果第一轮原型试点只做 button 与 trigger，不应该把 rule state layer 作为前置条件。后续进入 rule-heavy prototype 或 style/state rule 编目时再提升优先级。

下一步：

- 保持 `_debt`。
- 在 Rule Verification Summary 中标为 `blocked-by-fracture` 或 `documentation-only`，不得当作当前可测 conformance。

---

### F-002：Rule context static path access 未实现

来源：

- `internal/contracts/_debt/rule.deferred-semantics.md`
- `internal/contracts/rule/when.deps.context.v0.md`

当前事实：

- 旧草案描述 `w.ctx(key).path('a', 'b')`。
- 当前实现只支持 whole-value context dependency。
- `BaseButton/asButton` 与 `asTrigger` 不依赖 context path。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可作为 context/rule integration issue。

Decision 潜力：

- 需要决定 context path access 是 rule core 还是 context-query extension。

分析：

这是有效债务，但与第一轮 prototype pilot 没有直接关系。提前处理会扩大范围。

下一步：

- 继续保留 `_debt`。
- 不进入 `BaseButton/asButton` 或 `asTrigger` 依赖清单。

---

### F-003：Rule host-environment/meta 命名不稳定

来源：

- `internal/contracts/_debt/rule.deferred-semantics.md`

当前事实：

- `module-rule-meta` 目前提供 `w.meta(key)`。
- 文档明确 host-environment input 的命名和归属仍不稳定。
- 第一轮 pilot 不依赖 rule meta。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可成为 host environment input naming issue。

Decision 潜力：

- 需要决定 host environment input 是 rule core、secondary rule module，还是 host-cap/query abstraction。

分析：

不阻塞 `BaseButton/asButton` 与 `asTrigger`。虽然 `asTrigger` 依赖 host caps，但那是 runtime/module capability，不是 rule meta input。

下一步：

- 未来 host-cap 编目时再提升。

---

### F-004：`RuleHandle.dispose()` 与 setup-only removal 边界冲突

来源：

- `internal/contracts/_debt/rule.deferred-semantics.md`
- `packages/runtime/test/contract/as-hook.v0.contract.test.ts`

当前事实：

- rule declaration 是 setup-only。
- 当前 `RuleHandle.dispose()` 可在 setup 后调用，并已有 smoke 行为。
- asHook contract tests 已覆盖 captured rule disposer setup-only removal。
- `BaseButton/asButton` 不注册 rule。
- `asTrigger` 不注册 rule。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `as-hook`
- action: `defer`

Issue 潜力：

- 可成为 rule disposal phase issue。

Decision 潜力：

- 需要决定 rule removal 是 setup-only composition disposer，还是正式 runtime API。

分析：

它与 asHook disposer 模型有关，但不阻塞 button/trigger pilot。当前需要避免的是把 `RuleHandle.dispose()` 语义误写进 `BaseButton/asButton` 的原型契约。

下一步：

- 在 asHook verification 中标注 rule disposer 相关规则受此断口影响。
- 不作为 pilot 前置。

---

### F-005：RuleIR 仍可能保留 live handles

来源：

- `internal/contracts/_debt/rule.deferred-semantics.md`

当前事实：

- RuleIR 应原则上可序列化。
- 当前实现可能在 deferred state intent paths 中保留 live handles。
- `BaseButton/asButton` 不生成 rule IR。
- `asTrigger` 不依赖 RuleIR。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可成为 RuleIR serialization conformance issue。

Decision 潜力：

- 需要决定 RuleIR 与 runtime side table 的边界。

分析：

真实但不阻塞试点。它更接近 rule graph / compiler readiness，而不是 base prototype pilot。

下一步：

- Rule verification 中保留。
- 不进入 pilot dependency blocker。

---

### F-006：Feedback runtime flush lifecycle 未正式化

来源：

- `internal/contracts/_debt/feedback.flush.runtime.md`

当前事实：

- 当前 runtime flush 对 dirty change 无条件调用 `requestFlush()`。
- 这是为避免缺失 adapter completion signal 导致 runtime style 永不 flush 的补丁。
- `BaseButton/asButton` 本身不依赖 feedback runtime style flush。
- `asTrigger` 不依赖 feedback。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `adapter`
- action: `defer`

Issue 潜力：

- 可成为 feedback runtime flush lifecycle issue。

Decision 潜力：

- 需要决定 `effects.requestFlush()` 与 completion signal 的正式契约。

分析：

不阻塞 button/trigger pilot。后续 shadcn button 或 rule-driven style prototype 编目时会更相关。

下一步：

- 保持 `_debt`。
- 不把 feedback flush 作为 `BaseButton/asButton` 的核心依赖。

---

### F-007：Web style ownership contract 未正式化

来源：

- `internal/contracts/_debt/feedback.web-style-ownership.md`

当前事实：

- Web Component adapter 已有 owned-token 实现。
- 但它仍是实现实践，不是完整 cataloged contract。
- `BaseButton/asButton` 的核心协议不依赖 Web style ownership。
- shadcn button 会更直接依赖 style ownership。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `adapter`
- action: `defer`

Issue 潜力：

- 可成为 Web adapter style ownership issue。

Decision 潜力：

- 需要决定 adapter-owned style artifacts 与 app maker-authored classes 的所有权边界。

分析：

不阻塞第一轮 pilot。它应留给 Web adapter profile 或 shadcn prototype 编目阶段。

下一步：

- 在 Graph Relation Summary 中保留 adapter-side debt。
- 不进入 button/trigger blocker。

---

### F-008：exec-phase 术语锚点未统一

来源：

- `internal/contracts/_debt/terminology.exec-phase.md`
- 多个契约中的 setup-only / runtime-only 表述

当前事实：

- asHook、event、props、state、rule 都使用 setup-only/runtime-only 这类措辞。
- `lifecycle/exec-phase-guard.v0.md` 已存在，可作为语义锚点。
- asHook 与 `asTrigger` 都依赖 setup-only 约束。

判断：

- status: `open`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `as-hook`
- action: `carry-to-prototype-stage`

Issue 潜力：

- 可成为 terminology cleanup issue。

Decision 潜力：

- 低。主要是规范引用统一，不是语义重新设计。

分析：

它不阻塞 pilot，因为实现和测试已经通过 phase guard 约束 setup-only 行为。但如果编目 `asTrigger` 与 `asButton` 时继续使用“setup-only”措辞，应该明确锚到 exec-phase，而不是重新定义一套阶段模型。

下一步：

- Prototype Cataloging Pilot 文档中凡出现 setup-only/runtime-only，都引用 exec-phase guard。
- 后续再做全量术语统一。

---

### F-009：`module` 实体 schema 未定

来源：

- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`

当前事实：

- module entity schema 尚未正式决定。
- `asTrigger` 背后有 `@proto.ui/module-as-trigger`。
- 第一轮 pilot 可以引用模块实现与 contract tests，不必先定义完整 module entity schema。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可成为 0.3 module cataloging issue。

Decision 潜力：

- 高，但不是本轮前置。

分析：

不要为了 `asTrigger` 试点而提前设计完整 module schema。pilot 只需要记录它依赖 `module-as-trigger`，并说明这是 implementation/capability dependency。

下一步：

- 原型依赖清单里只做轻量引用。
- module schema 推迟到模块编目阶段。

---

### F-010：`host-cap` 实体 schema 未定

来源：

- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`

当前事实：

- `asTrigger` 依赖 `AS_TRIGGER_INSTANCE_CAP`、`AS_TRIGGER_PARENT_CAP`、`AS_TRIGGER_GET_PROTO_CAP`。
- `asButton` 也依赖 event、focus、expose-state 等 adapter/runtime capabilities。
- 但 host-cap 作为实体的最终 schema 尚未确定。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `adapter`
- action: `defer`

Issue 潜力：

- 可成为 host-cap cataloging schema issue。

Decision 潜力：

- 高，但不应阻塞 pilot。

分析：

第一轮可以用“依赖哪些 cap 常量 / port / facade”记录事实，不需要先发明正式 host-cap entity。否则范围会从 prototype pilot 膨胀到 host capability cataloging。

下一步：

- Prototype Cataloging Dependencies 中记录 cap dependency。
- 不把 host-cap schema 作为退出门槛。

---

### F-011：`adapter profile` 实体预留策略未定

来源：

- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`

当前事实：

- adapter profile 是否在 0.2 前预留尚未决定。
- `BaseButton/asButton` 在 React/Vue/Web Component adapter 中都有相关测试。
- 第一轮 prototype pilot 只需要区分 core prototype contract 与 adapter mapping evidence。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `adapter`
- action: `defer`

Issue 潜力：

- 可成为 adapter profile entity planning issue。

Decision 潜力：

- 中到高，但不是本轮前置。

分析：

不需要先设计 adapter profile 实体。当前应该把 adapter 测试作为 evidence，而不是把 adapter profile schema 拉进 pilot。

下一步：

- 在 Test Mapping Summary 中标注 adapter tests 是 translation evidence。
- adapter profile 推迟到 adapter cataloging 阶段。

---

### F-012：`prototype` 实体命名、编号与继承关系未定

来源：

- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`
- `internal/contracts/prototype-base/README.md`
- `internal/contracts/prototype-base/button.v0.md`

当前事实：

- `internal/contracts/prototype-base/button.v0.md` 已经把 `base-button` 与 `asButton` 视为同一协议面。
- `spec/decisions/D-PROTOTYPE-ENTITY-NAMING-0001.yaml` 已记录 prototype 实体命名规则。
- `spec/prototypes/P-BASE-BUTTON.yaml` 已作为首个 prototype 实体落地，并采用单一 `P-BASE-BUTTON` 实体承载 `base-button` direct prototype 与 `asButton` authoring entry。
- `spec/tests/T-BASE-BUTTON-0001.yaml` 已建立 Button prototype 测试实体映射。

判断：

- status: `resolved`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `close`

Issue 潜力：

- 应成为 Prototype Cataloging Pilot 的前置 issue。

Decision 潜力：

- 应形成最小决策：第一轮 prototype entity 如何命名、如何把 direct prototype 与 asHook form 绑定。

分析：

该断口已经解除。当前试点选择不引入复杂继承模型，而是让一个官方基础原型对应一个稳定 `P-*` 实体；direct prototype 与 asHook authoring entry 作为同一 protocol 的不同入口记录在 prototype 实体 criteria 中。higher-level prototypes 对基础原型的复用仍应通过后续关系图治理继续压实，但不再阻塞 Button/asTrigger pilot。

下一步：

- 在 Core Compaction closure 中标记 F-012 closed。
- 后续批量原型编目继续沿用 `P-*` 单实体模型，除非出现需要单独决策的继承/扩展场景。

---

### F-013：focus/overlay/hit/boundary 与 asHook scope 总问题过宽

来源：

- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`

当前事实：

- roadmap 把 focus、overlay、hit-participation、interaction-boundary 与 asHook scope 的最终关系图列为一个暂不解决问题。
- 对第一轮 pilot 来说，这个问题太宽。
- `BaseButton/asButton` 直接依赖 focus；不直接依赖 overlay、hit-participation、interaction-boundary。

判断：

- status: `merged`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `merge`

Issue 潜力：

- 原大项不适合直接成为 issue，应拆分。

Decision 潜力：

- 应拆成 F-014 与 F-015。

分析：

这是一个 umbrella fracture，不适合直接处理。把它作为一个整体会让 pilot 被 overlay/hit/boundary 拖住。

下一步：

- 合并/拆分为：
  - F-014：focus 与 asHook/core/adapter 边界。
  - F-015：overlay/hit/boundary 与 privileged asHook 的长尾关系。

---

### F-014：focus 是核心能力、privileged asHook 还是 adapter expectation

来源：

- `internal/contracts/focus/base-text/as-focusable.v0.md`
- `packages/prototypes/base/src/button/button.proto.ts`
- `packages/runtime/test/contract/focus.v0.contract.test.ts`
- `packages/adapters/*/test/focus.test.ts`

当前事实：

- 当时 `asButton` 使用带 patch 参数的 `asFocusable` 调用；2026-06-27 已迁移为 `asFocusable()` 加返回 handle 配置。
- focus 已被编目为宿主协同的逻辑交互目标管理域，见 `C-FOCUS-0001` 与 `C-FOCUS-0002`。
- `asFocusable()` 已被编目为特权 no-arg once asHook，见 `C-AS-FOCUSABLE-0001`。
- `asFocusScope()` 与 `asFocusRoving()` 已完成契约与测试实体编目，见 `C-AS-FOCUS-SCOPE-*`、`C-AS-FOCUS-ROVING-0001`、`T-FOCUS-*`。
- `D-FOCUS-STATE-INTERACTION-BOUNDARY-0001` 已记录 focus facts 不再由 generic state-interaction 直接拥有。
- button 的 exposed states 包含 `focused` 与 `focusVisible`。
- `focusSelf` expose method 依赖 focus handle。
- focus tests 已覆盖 disabled focusable rejects focus requests。
- dialog / adapter 手动验证中暴露的 focus scope activation、restore 与 focus-visible 问题已经通过 focus center 与 adapter wiring 修复，并由 runtime/adapter 测试覆盖。

判断：

- status: `resolved`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `close`

Issue 潜力：

- 应成为 BaseButton pilot 的前置 issue 或子任务。

Decision 潜力：

- 需要最小决策：BaseButton 契约引用 focus 时，引用的是 privileged asHook contract、focus domain contract，还是 adapter expectation。

分析：

这不是“focus 行为不存在”的问题，而是归属边界问题。当前归属已足够支持 Button/asTrigger pilot：

- `focused/focusVisible` 是 Button 暴露的状态，但其事实来源是 focus domain / `asFocusable()`。
- `focusSelf` 是 button 暴露的方法，但实际执行由 `asFocusable`/focus port 负责。
- `disabled` 同步到 focusable config 后，focus 请求必须被拒绝。

focus scope、roving focus、trap/restore 等能力已经完成最小契约与实现修复，足以支撑 dialog 与 Button 当前路径。已发现的 roving 细节问题不阻塞 Button/asTrigger pilot，应等列表、菜单、tabs 等集合类原型编目时再提升。

下一步：

- 在 Core Compaction closure 中标记 F-014 closed for pilot。
- 把 roving 细节问题留给集合类原型编目阶段，而不是继续阻塞 Button/asTrigger。

---

### F-015：overlay/hit/boundary 与 privileged asHook 的关系图未定

来源：

- `internal/contracts/overlay/as-overlay.v0.md`
- `internal/contracts/hit-participation/hit-participation.v0.md`
- `internal/contracts/interaction-boundary/interaction-boundary.v0.md`
- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`

当前事实：

- overlay、hit-participation、interaction-boundary 都有 draft contract。
- 它们更接近二级能力或 privileged asHook 能力。
- `BaseButton/asButton` 与 `asTrigger` pilot 不直接依赖这些能力。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可成为 privileged asHook scope map issue。

Decision 潜力：

- 高，但应放在 overlay/dropdown/dialog 等 prototype 编目之前。

分析：

这个问题真实存在，但不能作为 button/trigger pilot 的前置条件。等进入 dropdown/dialog/overlay 相关 prototype 编目时再提升。

下一步：

- 从当前 blocker 列表移出。
- 在 future risks 中保留。

---

### F-016：旧契约文档归档目录与迁移策略未定

来源：

- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md`

当前事实：

- roadmap 提出里程碑：契约实体成为真相源，旧契约文档归于历史档案。
- 归档目录与迁移策略尚未决定。
- 第一轮 pilot 可以继续使用现有 `internal/contracts/*` 与 `internal/records/*`。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `defer`

Issue 潜力：

- 可成为 documentation archival issue。

Decision 潜力：

- 中，但不阻塞 pilot。

分析：

不要在 pilot 前处理归档策略。当前更重要的是把试点实体与规则映射跑通。

下一步：

- 等 prototype pilot 后，根据实际实体形态再设计归档。

---

### F-017：asHook name / trace identity 规则与实现不一致

来源：

- `internal/contracts/as-hook/as-hook.v0.md`
- `internal/contracts/as-hook/base-text/as-hook.v0.md`
- `packages/core/src/prototype.ts`
- `packages/prototypes/base/src/button/button.proto.ts`
- `packages/runtime/test/contract/as-hook.v0.contract.test.ts`
- `packages/modules/as-trigger/src/impl.ts`

当前事实：

- asHook contract 写明普通 asHook `name` 必须满足 `/^as[A-Z]/`，违规必须 throw。
- `packages/core/src/prototype.ts` 中该校验被注释掉，并有 TODO。
- 现有 prototype base 大量 `defineAsHook` 使用 kebab-case name，例如 `as-button`、`as-dropdown-trigger`。
- runtime asHook contract tests 使用 camel-case name，例如 `asTrace`、`asConfigurable`。
- privileged `asTrigger` trace 使用 `asTrigger`。
- anatomy `requires` 示例也使用 `asTrigger`。
- `spec/decisions/D-AS-HOOK-CALLER-NAME-0001.yaml` 已记录决策：`defineAsHook({ name })` 中的 `name` 是 prototype spec name，应遵守 prototype name 规则；作者侧 caller binding 应呈现为 `asXxx`，该检查属于 lint、CLI、generator 或 TypeScript tooling，而不是 runtime `spec.name` 检查。

判断：

- status: `resolved`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `as-hook`
- action: `carry-to-prototype-stage`

Issue 潜力：

- 应成为 asHook naming/identity issue。

Decision 潜力：

- 已有决策：asHook 的 prototype spec name 与 author-facing caller binding name 属于不同命名域。

分析：

这原本是当前最明确的阻塞项之一。`BaseButton/asButton` pilot 必须引用 `asButton` 与 `as-button`，而 `asTrigger` 使用 `asTrigger` trace。`D-AS-HOOK-CALLER-NAME-0001` 已经给出足够的最小决策：

- `asButton` 是 TS export/caller 名称。
- `as-button` 是当前 authored asHook definition name。
- `asTrigger` 是 privileged hook trace name。
- ordinary authored asHook 的 `spec.name` 保持 prototype-style kebab-case。
- 未来 tooling 检测 author-facing caller binding 是否符合 `asXxx`。

剩余问题不再阻塞 pilot，而是文档与 tooling 落地：旧 asHook contract 中 `/^as[A-Z]/` 的 runtime naming rule 需要被更新或降级。

下一步：

- 更新 `internal/contracts/as-hook/as-hook.v0.md` 与中文底本中关于 `/^as[A-Z]/` 的命名规则。
- 后续 tooling 设计时检查 caller binding，而不是 runtime spec name。
- Prototype Cataloging Pilot 可以使用 `as-button` 作为 prototype spec identity，并把 `asButton` 记录为 authoring caller symbol。

---

### F-018：parameterized/configurable asHook 已实现但文档仍标 proposed

来源：

- `internal/contracts/as-hook/as-hook.v0.md`
- `internal/contracts/as-hook/as-hook.parameterized-design.md`
- `packages/core/src/prototype.ts`
- `packages/runtime/test/contract/as-hook.v0.contract.test.ts`
- `internal/contracts/focus/base-text/as-focusable.v0.md`

当前事实：

- asHook contract 将 parameterized caller shape、mode model、setup/configure split 标为 proposed direction。
- core/runtime 已支持 `options`、`mode: configurable`、`configure(...)`。
- runtime tests 覆盖 `AS-HOOK-0700`、`AS-HOOK-0800`、`AS-HOOK-0900`、`AS-HOOK-1000`。
- 普通 authored asHook 已收口为 no-arg once caller。
- `asFocusable()`、`asFocusScope()` 与 `asFocusRoving()` 已迁移为 no-arg caller，并通过返回 handle 进行 setup-time 配置。
- `D-AS-HOOK-PRIVILEGED-NO-ARG-MIGRATION-0001` 与 `C-AS-HOOK-PRIVILEGED-0001` 已记录特权 asHook 迁移方向。
- `asOverlay(patch)`、`asBoundary(patch)`、`asHitParticipation(...)`、`asTransition(options)` 与 collection/use-style hooks 仍需要逐个归类与迁移计划。

判断：

- status: `open`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `as-hook`
- action: `carry-to-next-asHook-pass`

Issue 潜力：

- 可成为 asHook contract promotion issue。

Decision 潜力：

- 需要决定哪些已实现行为应从 proposed 提升为 v0 contract。

分析：

它不直接阻塞 `asButton` 与 `asTrigger`，因为 `asButton` 是 ordinary once authored asHook，`asTrigger` 是 privileged once asHook。它过去间接影响 `asFocusable`，但 focus 相关 hooks 已经完成 no-arg + returned handle 的迁移。剩余问题属于下一轮 asHook governance，而不是当前 prototype pilot blocker。

下一步：

- Pilot 中只引用已被测试覆盖的 no-arg once 与 privileged asHook 行为。
- 下一轮 asHook pass 中继续处理剩余 parameterized privileged hooks 与 collection/use-style hook 的最终归类。

---

### F-019：`asTrigger` 缺少独立契约归属与实体边界

来源：

- `packages/hooks/src/as-trigger.ts`
- `packages/modules/as-trigger/src/impl.ts`
- `packages/runtime/test/contract/as-trigger.v0.contract.test.ts`
- `packages/adapters/base/src/events/web-event-router.ts`
- `internal/contracts/anatomy/base-text/02.structure.v0.zh-CN.md`

当前事实：

- `asTrigger()` 是 privileged hook，不通过 `defineAsHook`。
- 它注册 trace：`rt.register('asTrigger', { privileged: true, mode: 'once' })`。
- 它依赖 `module-as-trigger` facade 的 `apply()`。
- `apply()` 会标记 self 为 confirm owner，并在父链中查找带 `asTrigger` trace 的外层 owner，将 event root redirect 到最外层 trigger。
- runtime contract tests 已覆盖 self owner、parent redirect、多级 redirect、non-trigger parent 不 redirect。
- 当前已起草：
  - `spec/contracts/C-AS-TRIGGER-0001.yaml`
  - `spec/tests/T-AS-TRIGGER-0001.yaml`
  - `internal/contracts/as-trigger/as-trigger.v0.md`

判断：

- status: `resolved`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `as-hook`
- action: `carry-to-prototype-stage`

Issue 潜力：

- 应成为 `asTrigger` contract entity issue。

Decision 潜力：

- 已有最小方向：`asTrigger` 属于核心契约中的特权 asHook 小 scope，依赖 asHook 契约与 event 通路，并拥有独立 `as-trigger` 契约。

分析：

这是试点必需断口。当前已经给出契约归属：`asTrigger` 是 core privileged asHook，小于 props/event 这类大 scope，但仍是核心契约的一环。它的核心语义是把宿主中直接连续嵌套的 trigger 原型 event route 合并到连续 trigger 链的最外层 trigger。直接父子关系与父 prototype 查询由 host-cap 提供，`asTrigger` 只消费这些关系，不自行定义宿主树。

下一步：

- review 新增 asTrigger contract/test 实体。
- 后续在 `BaseButton/asButton` 依赖清单中使用 `depends-on C-AS-TRIGGER-0001`。
- 暂不把 focus、disabled、state interaction、overlay、boundary 或 hit participation 纳入 asTrigger 核心语义。

---

### F-020：`disabled` 行为的所有权边界未压实

来源：

- `internal/contracts/prototype-base/button.v0.md`
- `packages/prototypes/base/src/button/button.proto.ts`
- `packages/prototypes/base/test/as-button.test.ts`
- `packages/modules/state-interaction/src/create.ts`
- `packages/runtime/test/contract/focus.v0.contract.test.ts`
- `packages/adapters/web-component/test/contract/event.router.mapping.v0.contract.test.ts`

当前事实：

- `button` contract 要求 `disabled=true` suppress `click` 并清除 transient interaction states。
- `asButton` 定义 `disabled` prop，创建 `def.state.fromInteraction('disabled')`，并 expose `disabled` state。
- `syncDisabled` 会设置 disabled state，并调用 `focusable.setDisabled(nextDisabled)`。
- state-interaction module 中 `disabled` 会清理 `hovered` 与 `pressed` 等 interaction-owned transient state；focus facts 已移出 state-interaction ownership。
- Web event router 有 `isEnabled` gate，disabled 时不 emit `press.commit` 或 global key events。
- focus tests 证明 disabled focusable rejects focus requests。
- `P-BASE-BUTTON` 已明确 Button 拥有 `disabled` props input、disabled exposed state、activation suppression 与 transient state cleanup 的协调责任。
- `asButton` 实现已将 disabled 同步到 state、focus eligibility 与 activation handler。
- `T-BASE-BUTTON-0001` 已覆盖 disabled props 同步、interaction cleanup、focus rejection 与 disabled activation suppression。

判断：

- status: `resolved`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `close`

Issue 潜力：

- 应成为 BaseButton disabled boundary issue。

Decision 潜力：

- 需要最小决策：disabled 的每一部分分别由谁拥有。

分析：

`disabled` 不是单一行为。当前 Button pilot 已将其拆分为多层协作：

1. props default 与 prop watch：`asButton` 拥有。
2. exposed disabled state：`asButton` 承诺。
3. focus disabled config：focus/asFocusable 拥有。
4. transient interaction state reset：Button 触发 disabled 同步，state-interaction 与 focus 分别清理自己拥有的事实。
5. press/click/event suppression：event router gate 与 button `press.commit` handler 共同承担。

这已足够支撑常见 Button 使用方式。不同组件对 disabled 的细分语义仍可能不同，但该问题属于后续对应原型的自治设计，不再阻塞 BaseButton/asButton。

下一步：

- 在 Core Compaction closure 中标记 F-020 closed。
- 后续原型若拥有不同 disabled 语义，应在各自 P 实体中记录，而不是让 state-interaction 独断所有 disabled 行为。

---

### F-021：interaction signal 集合与 `fromInteraction` 投影未完全同步

来源：

- `internal/contracts/state/interaction/interaction-signals.v0.md`
- `internal/contracts/state/interaction/base-text/interaction-state-projection.v0.md`
- `packages/core/src/state.ts`
- `packages/modules/state-interaction/src/create.ts`
- `packages/prototypes/base/src/button/button.proto.ts`

当前事实：

- public core type `InteractionStateName` 包含 `disabled | hovered | pressed` 等 interaction-owned facts；focus facts 已改由 focus domain 直接提供。
- `BaseButton/asButton` 使用 `disabled`、`hovered`、`pressed`，并通过 `asFocusable()` 消费 `focused` 与 `focusVisible`。
- `interaction-signals.v0.md` 只明确列出 `focused` 与 `pressed`，措辞是 v0 MUST provide at least。
- interaction-state-projection 文档只存在于 `base-text` 目录，没有同步到根级英文 contract 文件。
- state core 文档明确 interaction-derived / fromInteraction 不在 state core 中定义。
- `D-FOCUS-STATE-INTERACTION-BOUNDARY-0001` 已解决 focus facts 是否属于 state-interaction 的阻塞问题。
- `P-BASE-BUTTON` 与 `T-BASE-BUTTON-0001` 已覆盖 Button 当前使用的 interaction facts。

判断：

- status: `deferred`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `base-prototype`
- action: `defer`

Issue 潜力：

- 应成为 interaction signals v0 set / projection sync issue。

Decision 潜力：

- 需要决定 button pilot 能否把 `hovered`、`focusVisible`、`disabled` 当作 v0 interaction signals。

分析：

这不再是 `BaseButton/asButton` 的直接阻塞项。阻塞点主要来自 focus facts 是否被 generic interaction signals 越权拥有；该问题已经通过 focus domain 编目和实现迁移解决。剩余问题是通用 interaction signal 集合与旧文档同步：哪些事实是所有交互原型可共享的 generic facts，哪些事实应由具体原型、focus、a11y 或其它 domain 自治。

下一步：

- 将 Button pilot 需要的 interaction facts 映射保留在 `P-BASE-BUTTON` / `T-BASE-BUTTON-0001`。
- 后续单独整理 state-interaction contract，避免把 focus、a11y 或组件自治语义重新吸回 generic interaction signals。

---

### F-022：expose event `click` 与 native/proto event 的边界需明确

来源：

- `internal/contracts/expose/expose-event.v0.md`
- `internal/contracts/event/event.v0.md`
- `internal/contracts/event/event-type.v0.md`
- `packages/prototypes/base/src/button/button.proto.ts`
- `packages/prototypes/base/test/as-button.test.ts`
- `packages/adapters/base/src/events/web-event-router.ts`

当前事实：

- `asButton` 定义 `def.expose.event('click', { payload: 'void' })`。
- `asButton` 监听 `press.commit`，enabled 时调用 `run.expose.emit('click')`。
- event type contract 把 `press.commit` 定义为 protocol core activation intent。
- expose event contract 说 outward events live in a dedicated namespace and must be fired via event module emit capability。
- Web event router 明确由 `event.emit()` 分发的 CustomEvent 不触发 `press.commit`，避免 `asButton` 合成 `click` 导致重复 toggle。
- `P-BASE-BUTTON` 已记录 `click` 是 Button protocol 约定的 outward signal 名称。
- Button 实现通过 `press.commit` 输入语义派生 `run.expose.emit('click')` 输出语义。
- `T-BASE-BUTTON-0001` 已覆盖 enabled activation emits `click`，disabled activation suppresses `click`。

判断：

- status: `resolved`
- blocksPrototypeCataloging: `false`
- affectedNextStage: `none`
- action: `close`

Issue 潜力：

- 应成为 button click outward event boundary issue。

Decision 潜力：

- 需要最小决策：`click` 作为 expose event key 是否允许复用 host/native 常见名称，以及它与 `press.commit` 的关系。

分析：

这是 `BaseButton/asButton` 编目必须压实的边界。当前已经明确：button 的 outward `click` 不是 native DOM click，也不是 Proto core event `press.commit`。它是 component → app maker 的 exposed event，由 Button protocol 从 activation intent 派生。

如果不明确，后续测试映射会把 native click、host:click、press.commit、expose click 混在一起。

下一步：

- 在 Core Compaction closure 中标记 F-022 closed。
- 后续 adapter profile 可继续讨论 outward `click` 在不同宿主中投影得多贴近原生事件，但这不改变 Button protocol 的输入/输出边界。

---

## 6）第一批建议处理顺序（2026-07-02 状态更新）

第一批 `decide-now` 项目前已经处理到不再阻塞 Button/asTrigger pilot：

1. F-012：prototype 实体命名、编号与直接/组合 entry 的绑定方式。
2. F-017：asHook name / trace identity 命名域。
3. F-019：`asTrigger` 契约归属与最小实体边界。
4. F-021：button-relevant interaction signals / projection set。
5. F-020：disabled 所有权边界。
6. F-014：focus 在 BaseButton 中的依赖边界。
7. F-022：`press.commit` → exposed `click` 的输入/输出边界。

这个顺序的理由：

- 先定实体命名和 asHook identity，否则后续关系图会污染。
- 再定 `asTrigger`，因为 `BaseButton` 依赖 official privileged trigger path。
- 再定 interaction/focus/disabled/click，因为它们构成 `BaseButton` 的行为规则主体。

当前结果：

- F-012、F-014、F-017、F-019、F-020、F-022 可以在 closure report 中标记为 closed / resolved for pilot。
- F-018 保持 open，但已从 Button/asTrigger pilot blocker 变为下一轮 asHook governance 任务。
- F-021 降级为 deferred：Button 所需的 interaction facts 已有实体与测试映射，通用 interaction signal 集合同步留给后续 state-interaction pass。
- a11y 并非本 inventory 的原始 F 项，但它在 Button 编目中暴露为新的基础能力缺口；当前已由 `D-A11Y-SEMANTIC-DOMAIN-0001`、`C-A11Y-0001`、`HC-A11Y-0001`、`M-A11Y-0001` 与 `T-A11Y-0001` 完成最小闭环。Button 的 optional a11y enhancement / relation / name source priority 继续 deferred。

---

## 7）不进入当前 blocker 的真实债务

以下断口真实存在，但不应阻塞第一轮 pilot：

- Rule deferred semantics：F-001 到 F-005。
- Feedback runtime / web style ownership：F-006 到 F-007。
- module / host-cap / adapter profile schema：F-009 到 F-011。
- overlay / hit participation / interaction boundary scope map：F-015。
- 旧契约文档归档策略：F-016。

这些项目适合继续保留为 issue 候选，但不应消耗 Core Compaction Pass 0.1 的主要时间盒。

---

## 8）下一步（2026-07-02 状态更新）

下一步不再是继续逐个处理上述 blocker，而是产出 Core Compaction Pass 0.1 closure：

1. `Core Compaction Pass 0.1 Closure` record：
   - 已关闭断口。
   - 部分解决 / carry-to-next-pass 断口。
   - deferred 扩展能力断口。
   - Button/asTrigger pilot readiness。

2. `Prototype Cataloging Dependencies` 清单：
   - `BaseButton / asButton`
   - `asTrigger`
   - 标明 props、state-interaction、focus、asTrigger、event/expose-event、a11y 等依赖的稳定度。

3. Rule verification 与 test mapping 的收尾：
   - `T-AS-TRIGGER-0001`
   - `T-BASE-BUTTON-0001`
   - `T-FOCUS-*`
   - `T-A11Y-0001`
   - asHook result ergonomics 断口对应的 `T-AS-HOOK-*` 增量。

---

## 9）后续讨论待办（2026-07-02 状态更新）

以下问题保留为后续设计讨论，不纳入当前 Button/asTrigger pilot blocker：

- F-018：剩余 parameterized privileged hooks 的 no-arg / returned-handle migration。
- F-021：通用 interaction signal 集合与 `fromInteraction` 文档同步；重点避免 focus、a11y 或具体原型自治事实被 generic interaction signals 重新吞并。
- asHook result ergonomics：`stateHandles` / `getState(...)` / expose-key projection 的推荐 authoring surface 与类型收紧。
- a11y enhancement：relation、description composition、disabled reason、explicit label/name source priority、host projection 降级策略。
- focus roving 细节：等列表、菜单、tabs 等集合类原型编目时跟进。
