# 2026-07-05 Switch 后续编目方向：Toggle Before Tabs

> Internal record. Not normative. 本文记录 `P-BASE-SWITCH` 编目闭环之后，下一轮 prototype cataloging 的阶段性方向选择。本文不直接新增 `P-*` 实体，也不替代后续 Toggle 契约草案、测试实体或实现校准。

---

## 1）背景

`P-BASE-SWITCH` 与 `P-BASE-SWITCH-THUMB` 编目已经完成一个新的小型 value-control 闭环，并在过程中压实了若干基础能力：

- `asHook` 返回命名 state handle。
- 嵌套 `asHook` 结果自动收集。
- `fromInteraction` / `fromAccessibility` 进入 deprecated 路径。
- ARIA 投射从 state-web 样式投射中切出，归入 a11y API / module / host capability。
- Switch root 与 thumb 的 anatomy / context / indicator 边界已有第一轮实践。

因此，下一轮可以继续用现存原型牵引 P 实体编目。但此时直接进入 Tabs 会显著扩大问题面。

Tabs 会同时牵引：

- root / list / trigger / content 多 part anatomy。
- selection model 与 active value。
- collection / item registry。
- roving focus 与 keyboard navigation policy。
- `tablist` / `tab` / `tabpanel` 的 a11y 关系。
- content visibility 与 mounting / presence 策略。

这些问题都重要，但它们更适合作为下一阶段复合组件牵引点，而不是紧接 Switch 之后立刻展开。

---

## 2）当前方向

下一轮建议先编目：

```text
P-BASE-TOGGLE first, P-BASE-CHECKBOX next, P-BASE-TABS deferred.
```

也就是说：

1. 先做 Toggle，用它收束 Switch / Button / Toggle 的边界。
2. 再做 Checkbox，用它扩展 checked state 到 mixed / form-adjacent 输入语义。
3. 最后进入 Tabs，集中处理 collection、roving focus 与 composite widget。

---

## 3）为什么先 Toggle

Toggle 是 Switch 之后最自然的对照原型。

它与 Switch 的共同点：

- 都可能拥有持久二值状态。
- 都会在 activation 后切换状态。
- 都需要区分 disabled、pressed、hovered、focusVisible 等状态。
- 都可以检验 state handle、asHook result、state-web style projection 与 a11y projection 的边界。

但它与 Switch 的差异也足够关键：

- Switch 的核心语义是 on/off value control。
- Toggle 更接近 button family 的持久状态变体。
- Toggle 通常不表达“开/关”设置语义。
- Toggle 更适合成组组合，例如 toggle group。
- Toggle 不应与 Form 产生联动。
- Toggle 的 a11y 语义更可能靠近 `aria-pressed` / toggle button，而不是 `role=switch` + `aria-checked`。

因此，Toggle 适合回答一个 Switch 阶段故意留下的问题：

> 共享底层二值切换行为的原型，是否仍应在 P 实体层保持独立协议边界？

当前倾向是：应保持独立。Switch 与 Toggle 可以共享底层 helper、module 能力或未来抽象出的 value/toggle 核心，但 P 实体不应互相吞并。

---

## 4）为什么 Checkbox 放在 Toggle 之后

Checkbox 与 Switch / Toggle 都共享 `checked` 这类状态表面，但它比 Toggle 更早引入额外复杂度：

- `indeterminate` / mixed state。
- form association。
- checkbox group 与集合语义。
- root / indicator anatomy。
- `aria-checked="mixed"` 等 a11y 特例。

因此，Checkbox 很适合作为 Toggle 之后的第二个同级原型：

- Toggle 先压实“持久二值 button-like state”。
- Checkbox 再压实“checked 输入语义 + mixed state + indicator anatomy”。

这会让二值 / 三值输入类原型在进入 Tabs 前形成更完整的对照组。

---

## 5）为什么 Tabs 继续延后

Tabs 是高价值目标，但它不是当前最小增量。

如果现在直接进入 Tabs，容易把以下问题捆在一起：

- P 实体按 anatomy part 拆分的规则。
- collection / item identity 的契约归属。
- roving focus 与 active descendant 的策略。
- controlled / uncontrolled active value。
- content part 的 visibility、mounting 与 presence。
- a11y role / state / relationship projection。

这些问题很可能需要单独的 D 实体与基础契约修订。先完成 Toggle / Checkbox，可以让 Tabs 编目时拥有更稳定的基础样本：Button、Switch、Toggle、Checkbox。

---

## 6）Toggle 契约讨论入口

正式起草 `P-BASE-TOGGLE` 前，建议先讨论以下问题。

### 6.1 Toggle 是什么

工作性定义可以从这里开始：

> Toggle is a button-like control that represents a persistent binary active state and toggles that state on successful activation.

中文表述：

> Toggle 是一种 button-like control。它表示一个持久二值 active state，并在成功 activation 后切换该状态。

需要讨论：

- 这个持久状态应命名为 `checked`、`pressed`、`selected`，还是其他 protocol-specific 名称。
- P 实体是否应明确 Toggle 不是 on/off value control。
- P 实体是否应明确 Toggle 不参与 Form。
- Toggle 是否应被视为单一交互主体，还是为 ToggleGroup 预留 part / item 边界。

### 6.2 与 Button 的边界

Button 的 `pressed` 是 transient press lifecycle。

Toggle 的核心状态如果也叫 pressed，需要明确：

- Button pressed 与 Toggle pressed 是否同名但不同持久性。
- Toggle 是否应复用 Button 的 activation / disabled / focus / hover / press 准则。
- Toggle 是否应依赖 `asButton`，还是像 Switch 一样保持 P 实体独立。

当前倾向：

- Toggle 可以参考 Button 的 activation、focus、disabled、interaction feedback 准则。
- Toggle 不应通过消费 Button P 实体获得自身语义。
- 如果实现层继续复用 helper，应确保 P 实体上表达的是 Toggle 自身协议。

### 6.3 与 Switch 的边界

Switch 与 Toggle 的关键差异应至少覆盖：

- Switch 是 on/off setting-like value control。
- Toggle 是 button-like persistent active control。
- Switch 的 a11y 应走 `role=switch` / checked state。
- Toggle 的 a11y 更可能走 button / `aria-pressed`。
- Switch 可能保留 form integration open question。
- Toggle 当前应明确不与 Form 联动。

这部分很适合形成 `P-BASE-TOGGLE` 对 `P-BASE-SWITCH` 的 `references` 关系，而不是 `dependsOn` 或继承关系。

### 6.4 与 ToggleGroup 的关系

ToggleGroup 不应抢跑，但 Toggle 需要为它保留边界。

需要讨论：

- 单个 Toggle 是否只拥有自身 binary state。
- ToggleGroup 是否未来负责 exclusive / multiple selection。
- Toggle 在 group 中的状态是否应仍由 Toggle 自身持有，还是由 group 提供 controlled value。
- Toggle 的 P 实体是否需要提前声明 group membership 是 deferred。

第一轮可以只落单个 Toggle，避免把 group selection 与 collection 提前拉入。

---

## 7）下一步

建议下一轮按以下顺序推进：

1. 阅读现有 `base toggle` 与 `shadcn toggle` 实现、测试和已使用的 state / a11y API。
2. 对照 Button、Switch 的 P 实体，列出 Toggle 可参考准则。
3. 对照 ARIA toggle button、Radix Toggle、Base UI Toggle、React Aria ToggleButton 等资料，确认 Toggle / Switch / Checkbox 边界。
4. 先在对话中形成 `P-BASE-TOGGLE` 草案结构，不直接落实体。
5. 决定 Toggle 状态命名、signal 命名、props 最小面、a11y 投射与 Form 非目标。
6. 草案确认后再落 `P-BASE-TOGGLE`、测试实体与实现校准。

---

## 8）非目标

本记录不决定以下问题：

- `P-BASE-TOGGLE` 的最终 criteria 文本。
- Toggle 状态最终命名。
- Toggle outward signal 最终命名。
- ToggleGroup 是否进入同轮编目。
- Checkbox 的 mixed state 契约。
- Tabs / collection / roving focus 的最终模型。
