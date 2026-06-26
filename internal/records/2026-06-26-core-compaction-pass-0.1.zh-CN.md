# 2026-06-26 Core Compaction Pass 0.1 计划

> Internal record. Not normative. 本文记录进入下一轮原型契约编目前的一次核心契约压实计划。它是阶段性工作计划，不等同于正式的 `D-*` 决策实体、`C-*` 契约实体或发布承诺。

---

## 1）背景

截至本记录形成时，核心契约与测试实体已经完成第一轮编目，覆盖范围包括 props、lifecycle、template、feedback、event、state、expose、context、anatomy、rule 与 asHook 等主线。

下一阶段原计划进入原型层系统编目。但如果直接开始原型契约编目，会把核心层中尚未压实的断口、规则验证状态和测试映射问题带入原型层，导致后续在原型编目时反复回头修核心概念。

因此，在正式进入原型层批量编目前，先执行一个短周期压实阶段：

```text
Phase 0: Core Compaction Pass 0.1
Phase 1: Prototype Cataloging Pilot
Phase 2: Batch Prototype Cataloging
Phase 3: Graph Hardening
```

本阶段的目标不是把核心契约整理到完美，而是为原型编目清理地基。

---

## 2）目标

Core Compaction Pass 0.1 的目标是：

> 只压实会影响下一阶段原型编目的核心契约、测试映射、图关系和断口。

本轮不做全量大扫除，不追求清零所有 open fracture。断口在协议设计中可以是显性化的未知；真正需要避免的是隐性断口、重复断口、过时断口、伪断口，以及阻塞但无人处理的断口。

本阶段只处理或明确标记这些问题：

- 已经过时的断口。
- 已经有决策但未关闭的断口。
- 互相重复的断口。
- 会阻塞 base 原型编目的断口。
- 会污染 asHook 边界的断口。
- 会导致测试映射或关系图继续扩散的核心规则问题。

---

## 3）事实基线

当前仓库中已经存在可作为第一轮原型编目试点的实现与契约材料：

- `internal/contracts/prototype-base/button.v0.md`
- `packages/prototypes/base/src/button/button.ts`
- `packages/prototypes/base/test/as-button.test.ts`
- `packages/hooks/src/as-trigger.ts`
- `packages/runtime/test/contract/as-trigger.v0.contract.test.ts`

`base-button` 与 `asButton` 已经存在，并且 `button` 契约明确两者共享同一个协议面。`asTrigger` 也已经作为 privileged hook 存在，并有 runtime contract test 覆盖。

因此，Prototype Cataloging Pilot 的首批覆盖对象暂定为：

```text
1. BaseButton / asButton
2. asTrigger
```

本轮暂不选择以下对象作为试点：

- `BaseInput`：长期可能需要，但当前仓库没有对应 base prototype 实现，第一轮不适合选择未实现对象。
- `asDisabled`：当前仓库没有可确认的独立 asHook 形态，不应把讨论记录中的假设直接写入计划。
- 大批量 base prototypes：例如 dropdown、select、tabs、switch、toggle 等应在试点完成后再系统推进。

---

## 4）断口状态模型

每个断口必须进入以下状态之一：

```ts
type FractureStatus = 'open' | 'resolved' | 'obsolete' | 'merged' | 'deferred';
```

状态含义：

- `open`：仍然真实存在，并且需要继续处理。
- `resolved`：已有明确决策，可以关闭。
- `obsolete`：前提已经变化，不再成立。
- `merged`：与其他断口重复，合并处理。
- `deferred`：真实存在，但不阻塞下一阶段原型编目。

断口记录至少应补充以下字段：

```ts
type FractureCompactionRecord = {
  id: string;
  title: string;
  status: FractureStatus;
  blocksPrototypeCataloging: boolean;
  affectedNextStage: 'base-prototype' | 'as-hook' | 'translation' | 'adapter' | 'none';
  action: 'close' | 'merge' | 'defer' | 'decide-now' | 'carry-to-prototype-stage';
};
```

本轮只优先处理 `blocksPrototypeCataloging: true` 的断口。`deferred` 不是失败状态。

---

## 5）规则验证状态模型

每条核心规则至少应标记验证方式：

```ts
type VerificationKind =
  | 'testable'
  | 'snapshot-checkable'
  | 'static-checkable'
  | 'review-only'
  | 'documentation-only'
  | 'blocked-by-fracture';
```

使用原则：

- 不把哲学规则强行标成 `testable`。
- 依赖未决概念的规则标为 `blocked-by-fracture`。
- 只能通过设计审查判断的规则标为 `review-only`。
- 只解释项目立场的规则标为 `documentation-only`。
- 可通过类型、schema 或 lint 类机制检查的规则标为 `static-checkable`。
- 可通过快照或结构输出检查的规则标为 `snapshot-checkable`。

本轮目标是让至少 80% 的核心规则有 verification 标记，而不是追求 100%。

---

## 6）图关系压实策略

下一阶段禁止继续新增泛 `related-to` 关系。关系应尽量进入明确类型，无法确认的关系先放入 candidate 区。

正式关系类型暂按以下集合推进：

```ts
type RelationKind =
  | 'depends-on'
  | 'refines'
  | 'implements'
  | 'constrains'
  | 'preserves'
  | 'transforms'
  | 'conflicts-with'
  | 'blocked-by'
  | 'tests'
  | 'documents'
  | 'derives-from'
  | 'shares-invariant-with';
```

本轮不全量重分所有历史关系，只优先压实：

1. 会被 `BaseButton / asButton` 引用的核心契约关系。
2. 会被 `asTrigger` 引用的核心契约关系。
3. 测试实体和规则之间的 `tests` 关系。
4. 断口和规则之间的 `blocked-by` 关系。

---

## 7）执行 Pass

### Pass 1：断口压实

目标：逐个扫过当前已显性化的核心断口。

候选来源：

- `internal/contracts/_debt/*`
- `internal/contracts/DEBT.v0.md`
- `internal/records/2026-06-23-contract-catalog-roadmap.zh-CN.md` 中的暂不解决项
- 核心契约文档中仍以 draft、proposed、deferred、TBD 等形式存在的段落

每个断口输出：

- status
- 是否阻塞原型编目
- 影响哪些实体
- 是否已有决策
- 下一步动作

优先判断这些问题是否阻塞 `BaseButton / asButton` 或 `asTrigger`：

- event 语义与用户触发边界。
- expose event 和 event router 的边界。
- disabled 行为是否属于 button 核心契约、trigger 契约，还是具体 prototype 契约。
- focus 是核心能力、privileged asHook 能力，还是 adapter expectation。
- slot 与 anatomy 对 trigger-style 组件的最低要求。
- asHook dedupe、trace 与 privileged hook 的稳定边界。

### Pass 2：规则 verification 压实

目标：核心规则不再只是文字。

每条规则至少形成：

```ts
type RuleVerificationRecord = {
  id: string;
  statement: string;
  strength: 'must' | 'should' | 'may' | 'must-not';
  verification: VerificationKind;
  blockedBy?: string[];
};
```

本轮重点覆盖：

- button 相关规则。
- asHook 核心规则。
- asTrigger runtime 规则。
- event、expose、focus、state 中会被 button/trigger 直接依赖的规则。

### Pass 3：测试映射压实

目标：搞清楚现有测试到底在验证哪些契约规则。

至少产出三类清单：

- 已被测试覆盖的规则。
- `testable` 但未覆盖的规则。
- 没有对应规则的测试。

第三类需要进一步判断：

- 如果测试验证的是实现细节，应降级、改写或保留为非契约测试。
- 如果测试验证的是合理协议行为，则补齐对应契约规则或测试实体映射。

第一轮重点映射：

- `packages/prototypes/base/test/as-button.test.ts`
- `packages/runtime/test/contract/as-trigger.v0.contract.test.ts`
- 与 `asButton` 在 adapter 中相关的 focus/event 测试

### Pass 4：原型依赖清单

目标：产出 `Prototype Cataloging Dependencies`，为试点编目提供入口。

首批依赖清单只覆盖：

- `BaseButton / asButton`
- `asTrigger`

每个对象至少记录：

- 依赖哪些核心实体。
- 哪些依赖是 stable。
- 哪些依赖仍有断口。
- 哪些规则会直接影响原型编目模板。
- 哪些测试可以作为契约映射入口。

---

## 8）退出门槛

Core Compaction Pass 0.1 完成后，进入 Prototype Cataloging Pilot 前应满足：

1. 所有已知断口都有状态：`open / resolved / obsolete / merged / deferred`。
2. 阻塞 `BaseButton / asButton` 与 `asTrigger` 的断口被明确标出。
3. 至少 80% 核心规则有 verification 标记。
4. 测试实体和核心规则之间建立基本 `tests` 映射。
5. 下一阶段会用到的核心实体不再处于 raw/draft 未判断状态。
6. 下一阶段禁止新增泛 `related-to` 关系。
7. 产出一份面向 `BaseButton / asButton` 与 `asTrigger` 的 Prototype Cataloging Dependencies 清单。

不要求：

- 清零所有 open fracture。
- 补完所有核心规则测试。
- 完成所有 base prototypes 的原型编目。
- 为未实现对象提前设计契约。

---

## 9）建议时间盒

建议控制在 5 到 7 天，不超过两周：

```text
Day 1-2: 断口压实
Day 3: 规则 verification 标记
Day 4: 测试映射抽查与补洞
Day 5: 图关系最小压实
Day 6: 原型依赖清单
Day 7: Core Compaction Report
```

如果执行过程中发现某个断口需要更长设计，不应无限拖住本阶段；应将它标为 `deferred` 或 `carry-to-prototype-stage`，并明确它对试点对象的影响。

---

## 10）后续产物

本阶段至少应产出：

1. Core Compaction Report
2. Fracture Summary
3. Rule Verification Summary
4. Test Mapping Summary
5. Graph Relation Summary
6. Prototype Cataloging Dependencies

推荐报告结构：

```md
# Core Contract Compaction Report

## Scope

## Fracture Summary

## Rule Verification Summary

## Test Mapping Summary

## Graph Relation Summary

## Prototype Cataloging Readiness

## Decisions Made

## Decisions Deferred

## Next Stage Risks
```

报告完成后，再进入 `BaseButton / asButton` 与 `asTrigger` 的 Prototype Cataloging Pilot。
