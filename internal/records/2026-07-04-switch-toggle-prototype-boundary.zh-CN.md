# 2026-07-04 Switch / Toggle 原型边界与 P 实体规划补充

> Internal record. Not normative. 本文补充 `2026-07-03-next-prototype-catalog-switch-first.zh-CN.md` 中关于 Switch 的讨论。它记录当前人工讨论形成的阶段性判断，不直接新增 `P-*` 实体，也不替代后续正式契约、测试实体或实现校准。

---

## 1）背景

上一份记录建议下一轮 prototype cataloging 选择：

```text
P-BASE-SWITCH first, P-BASE-TABS deferred.
```

这个方向仍然成立：Switch 仍适合作为 Button 之后的下一轮牵引原型，因为它引入持久二值状态，又不会像 Tabs 那样立刻展开集合、roving focus、tabpanel 与 collection governance。

但上一份记录中把 Switch 简化为“单一交互主体”的说法存在瑕疵。进一步讨论后，当前判断是：

- Switch 不应被理解为只有一个结构部分。
- Switch 通常包含 root 与 indicator/thumb 一类视觉状态表达结构。
- Switch 的状态语义不是泛泛的 binary pressed，而是明确的 on/off。
- Switch 既展示一个持久二值状态，也可以通过交互输入切换该状态。
- Switch 可能与 Form 产生联动。

因此，本记录用于修正 Switch 的 prototype boundary 讨论，并初步规划后续 P 实体拆分策略。

---

## 2）原型边界原则

Proto UI 白皮书《原型边界》给出的核心判断不是按视觉切块、DOM 层级或文件组织拆分原型，而是看一个子结构是否承担独立的信息通路责任。

当前讨论采用以下工作原则：

1. 如果一个子结构激活了除 `feedback` 之外的信息通路，它应被视为独立 prototype protocol 的候选。
2. 如果一个子结构只承担 `feedback`，它可拆可不拆，应按复用价值、可读性和官方 authoring entry 稳定性判断。
3. 如果一个子结构没有激活任何信息通路，它不应因为视觉上可命名而被机械拆成独立 P 实体。
4. Anatomy role 是识别 compound component 结构边界的重要线索，但不自动等于 P 实体边界。

换句话说：

> `P-*` 不应机械地按 anatomy role 全量拆分，而应按官方 prototype protocol 与独立信息通路责任拆分。

---

## 3）Switch 的工作性定义

当前讨论中，Switch 可以临时理解为：

> Switch 是一个具备数据展示与数据输入双重功能的 on/off value control。它展示一个符合开关语义的持久二值状态，并在成功 activation 后切换到与之前不同的另一个状态。

这一定义包含几个关键点：

- Switch 的核心状态语义是 on/off，而不是泛化的 pressed。
- Switch root 是 semantic owner，负责持有 checked/on-off state、处理 activation、对外 expose 状态与 signal，并承接 a11y 与可能的 form 边界。
- Switch thumb / indicator 主要表达状态，不应成为 event target。
- Switch 的视觉表现通常类似物理开关，但物理开关外观不是核心契约。
- Switch 与 Form 的关系需要保留为重要后续问题；它可能不像 Button form integration 那样纯粹 deferred。

这里的“root 是 semantic owner”不表示 Switch 只有一个 anatomy part，而是表示整体 protocol 与 root protocol 在第一轮 P 实体中很可能合并。

---

## 4）Toggle 的工作性对照

Toggle 与 Switch 在功能上相近：都可能表达持久二值状态，且 activation 后切换状态。

但当前讨论倾向于将 Toggle 视为不同 prototype protocol：

- Toggle 更接近 button family 的持久状态变体。
- Toggle 更适合被看作单一交互主体。
- Toggle 更适合成组组合，例如 toggle group。
- Toggle 的状态语义更接近 pressed / selected，而不是 on/off。
- Toggle 不应与 Form 产生联动。

这意味着 Switch 与 Toggle 即使共享底层行为模式，也不应通过复用彼此的 prototype protocol 获得自身语义。它们可以共享核心契约、特权 asHook、module 能力或后续抽象出的 value-control 能力，但不应在 P 实体层互相吞并。

---

## 5）Switch anatomy 与 P 实体规划

当前建议把 Switch 的 P 实体规划为三类判断：

### 5.1 必落：`P-BASE-SWITCH`

`P-BASE-SWITCH` 表示整体 Switch protocol，并在第一轮中与 root protocol 合并。

它应承载：

- Switch 是 on/off value control。
- root 是 anatomy domain anchor 与 semantic owner。
- root 持有 `checked` 或等价 on/off state。
- activation 成功后切换到另一状态。
- disabled 抑制 activation 与状态变更。
- root expose checked/on-off state。
- root emit checked/on-off change signal。
- root 投射 switch a11y role、accessible name 与 checked state。
- root 处理 focus 与 keyboard activation。
- root 保留 form integration 的 core/deferred 边界。

合并整体组件与 root 的理由：

- root 是 anatomy domain 的作用域锚点。
- root 是 Switch 的状态与交互语义 owner。
- 在第一轮编目中拆出 `P-BASE-SWITCH` 与 `P-BASE-SWITCH-ROOT` 容易造成重复。
- 除非后续出现非 root semantic owner 或多 root 变体，否则合并更清晰。

### 5.2 倾向落：`P-BASE-SWITCH-THUMB`

`P-BASE-SWITCH-THUMB` 是否需要独立 P 实体，取决于我们是否把 thumb 作为稳定官方 authoring entry。

当前倾向是：应该落，但要明确它的性质。

理由：

- 当前库已经存在 `base-switch-thumb` 与 `asSwitchThumb`。
- thumb 不是 event target，也不拥有 Switch value。
- thumb 更像 indicator：通过 anatomy / part view 读取 root exposed state，并把该状态映射为视觉反馈。
- 对下游 Switch 定制原型来说，thumb 是高频稳定定制点。
- 如果官方继续提供 thumb authoring entry，它已经不只是父模板内部的一段结构，而是独立 prototype protocol。

因此，thumb 的 P 实体不应把它描述成另一个 control，而应描述成：

> Switch thumb is a same-domain indicator part that reflects the root Switch state without owning activation or value semantics.

### 5.3 暂缓：`P-BASE-SWITCH-TRACK`

`track` 当前不建议在第一轮落独立 P 实体。

理由：

- track 往往只是容器、背景或附属模板结构。
- track 有时甚至不需要动态 feedback。
- 如果 track 只读取 context/anatomy 或只作为布局背景，它未必值得成为稳定 prototype protocol。
- 强行拆分会增加 P 实体数量，但不一定增加协议表达力。

更合适的第一轮处理方式：

- 在 `P-BASE-SWITCH` 中保留 track 是否作为 anatomy role 的 open question。
- 如果需要支持某些下游定制，可以先通过 anatomy family/profile 表达 track 的可选结构位置。
- 只有当官方提供 `base-switch-track` / `asSwitchTrack`，且它承担独立 feedback、props、expose、context 或 anatomy 读取责任时，再提升为 `P-BASE-SWITCH-TRACK`。

---

## 6）P 实体拆分规则的阶段性表述

后续 prototype cataloging 可以临时采用以下规则：

> 一个 compound component 应优先拥有一个 component/root P 实体。额外 part P 实体只为那些由官方稳定暴露、并承担独立 prototype protocol 责任的 anatomy part 创建。Feedback-only part 可以保留为 component P 下的 criteria、anatomy role 或 profile，除非库刻意把它作为稳定 authoring entry 暴露给原型作者。

这条规则避免两个极端：

- 不把 compound component 的所有 anatomy role 都机械提升为 P 实体。
- 也不把已经拥有独立信息通路或稳定 authoring entry 的 part 压回父原型内部。

---

## 7）对上一份记录的修正

`2026-07-03-next-prototype-catalog-switch-first.zh-CN.md` 中“Switch 仍是单一交互主体”的说法应被本记录修正为：

```text
Switch is a single semantic value-control owner at the root level, but it may be a compound anatomy family with indicator parts such as thumb.
```

中文表述：

```text
Switch 在 root 层拥有单一语义与 value-control owner，但它可以是包含 thumb / indicator 等 part 的 compound anatomy family。
```

因此，选择 Switch 而不是 Tabs 的理由也应微调：

- 不是因为 Switch 没有 compound structure。
- 而是因为 Switch 的 compound structure 主要服务一个 root-owned on/off value control。
- 它不会像 Tabs 那样立刻牵引 collection、roving focus、tabpanel、active item/content visibility 等复合交互系统。

---

## 8）外部资料调研方向

在落正式 `P-BASE-SWITCH` 前，应再进行一轮外部资料 sweep，至少覆盖：

- WAI-ARIA `switch` role 与 APG switch pattern。
- ARIA toggle button / `aria-pressed` 与 switch / `aria-checked` 的边界。
- HTML checkbox 与 form-associated behavior。
- Open UI 对 switch、toggle、checkbox 等组件的分类。
- Radix UI Switch / Toggle。
- Base UI Switch / Toggle。
- React Aria Switch / ToggleButton。
- 原生平台控件，例如 UIKit `UISwitch`、Android `Switch`。

调研目标不是照搬任一库 API，而是确认：

- Switch 与 Toggle 是否应拆成不同 prototype protocol。
- Switch 的 root/thumb/track anatomy 是否应作为官方稳定 authoring entries。
- Switch form integration 在 Base Switch 中应是 core、deferred，还是 adapter/host capability。
- 状态命名应采用 `checked`、`on`、`value`，还是分层表达。
- outward signal 应命名为 `checkedChange`、`change`、`toggle`，还是其他 protocol-specific signal。

---

## 9）下一步

建议后续按以下顺序推进：

1. 对 Switch / Toggle / Checkbox 做外部资料 sweep，并形成简短对照表。
2. 决定 `P-BASE-SWITCH` 第一层 core props 与 exposed state 命名。
3. 决定 Switch outward signal 名称与 payload。
4. 决定 Switch a11y projection 与 form integration 的第一轮边界。
5. 决定 `P-BASE-SWITCH-THUMB` 是否与 `P-BASE-SWITCH` 同轮落地。
6. 将 track 保留为 anatomy role / profile open question，除非调研显示它应作为稳定 authoring entry。
7. 再起草正式 P/T 实体与实现校准计划。

---

## 10）暂不解决的问题

本记录不决定以下问题：

- `P-BASE-SWITCH` 的最终 criteria 文本。
- `P-BASE-SWITCH-THUMB` 是否一定同轮落地。
- 是否引入 `base-switch-track` 或 `asSwitchTrack`。
- Switch 状态命名采用 `checked`、`on`、`value` 或其他形式。
- Switch outward signal 的最终命名。
- Switch form integration 是否属于 Base Switch 第一层 core protocol。
- Toggle 是否紧随 Switch 之后编目，还是延后到 group / pressed state 讨论阶段。
- Checkbox 与 Switch 的边界是否需要同轮讨论。

这些问题应在外部资料 sweep 与 P 实体草稿阶段继续处理。

---

## 11）参考

- `internal/records/2026-07-03-next-prototype-catalog-switch-first.zh-CN.md`
- `apps/www/src/content/docs/zh-cn/whitepaper/prototype-boundary.md`
- `spec/knowledge/K-PROTOTYPE-COMPOSITION-0001.yaml`
- `spec/contracts/C-ANATOMY-0001.yaml`
- `spec/contracts/C-ANATOMY-0004.yaml`
- `spec/contracts/C-ANATOMY-0005.yaml`
- `spec/contracts/C-ANATOMY-0008.yaml`
- `spec/contracts/C-ANATOMY-0009.yaml`
- `packages/prototypes/base/src/switch/root.proto.ts`
- `packages/prototypes/base/src/switch/thumb.proto.ts`
- `packages/prototypes/base/src/switch/shared.ts`
- `packages/prototypes/base/src/toggle/toggle.proto.ts`
