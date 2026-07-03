# 2026-07-03 下一轮原型编目方向：Switch First

> Internal record. Not normative. 本文记录 Core Compaction / Prototype Cataloging Pilot 在 Button/asTrigger/a11y 之后的下一步方向选择。本文不直接新增 `P-*` 实体，也不替代后续人工讨论、契约审查与测试编目。

---

## 1）背景

本轮契约压实最初目标是清理阻塞 `BaseButton / asButton` 与 `asTrigger` 的核心断口。经过 Button、focus、a11y、asTrigger 与 workspace 可视化相关工作后，当前事实是：

- `P-BASE-BUTTON` 已作为首个 prototype entity 落地。
- `asTrigger` 已有独立核心契约与测试实体。
- focus domain、asFocusable、asFocusScope、asFocusRoving 的最小模型已经足以支撑 Button/Dialog 当前路径。
- a11y module 已经提供可投射语义对象的最小能力，并被 Button 消费。
- `P-*` criteria 现在可以记录准则级 `dependsOn`，workspace GUI 也可以展示这些依赖。

同时，直接横向压实所有剩余断口的策略已经被证明不够经济：缺少原型实验牵引时，很多契约边界很难形成可审查的人工决策。

因此，下一阶段应继续选择一个合适的原型作为编目牵引点，遇到断口再逐个压实。

---

## 2）候选方向

本轮主要比较两个方向：

- 小步推进：`Switch`
- 大步推进：`Tabs`

相关的已实现原型事实：

- `packages/prototypes/base/src/switch/*` 已存在。
- `packages/prototypes/base/src/tabs/*` 已存在。
- `packages/prototypes/base/test/switch.test.ts` 与 `packages/prototypes/base/test/tabs.test.ts` 均已有测试基础。

相关的已知契约事实：

- 已有 Button、asTrigger、focus、a11y、state interaction、event/expose 等基础契约可供复用。
- 已知 roving focus 细节问题被有意推迟到列表、菜单、tabs 等集合类原型阶段。
- collection/use-style hooks 的最终归类仍是后续治理问题。

---

## 3）问题陈述

下一轮原型编目需要满足两个目标：

1. 继续通过真实原型压实核心契约，而不是脱离实现横向讨论所有断口。
2. 控制单轮 blast radius，避免一次性引入过多未压实的复合组件结构、导航和集合能力。

如果直接选择 `Tabs`，它会同时牵引：

- composite widget 结构。
- tablist/tab/tabpanel 的 anatomy 与 a11y 映射。
- roving focus ownership 与 keyboard navigation policy。
- collection/useCollection/useCollectionItem 的最终归类。
- controlled/uncontrolled active value 与 content visibility。

这些问题都重要，但它们会让下一轮编目从“单一交互主体”直接跳到“复合交互系统”，验证和审查成本较高。

---

## 4）当前决策

下一轮 prototype cataloging 推荐选择：

```text
P-BASE-SWITCH first, P-BASE-TABS deferred.
```

`Switch` 作为 Button 之后的下一步牵引原型，用来压实：

- 单一交互主体上的持久二值状态。
- `checked/on` 与 Button transient `pressed` 的边界。
- `disabled` 在不同交互组件中的自治语义。
- `asButton` 不应被 switch 复用的基础原型独立性决策。
- `role=switch`、accessible name、checked state projection 与 a11y module 的关系。
- Switch props 最小面，尤其是 `checked` / `defaultChecked` / `disabled` 是否进入第一层 core props。
- Switch activation 后应 emit 何种 outward signal，以及该 signal 是否携带 next checked value。

`Tabs` 暂不作为下一轮首选，但保留为 Switch 后的复合组件牵引点。

---

## 5）理由

选择 `Switch` 的主要理由：

1. 它比 Button 多出一个真实的新语义面：持久二值状态。
2. 它仍是单一交互主体，不会立刻扩大到集合、roving、tabpanel 与复合结构。
3. 它可以复用并检验 Button 阶段形成的契约方法：P 实体准则、准则级依赖、原型代码注释、T 实体与测试用例映射。
4. 它会自然检验 `D-BASE-PROTOTYPE-INDEPENDENCE-0001`：Switch 不应通过消费 `asButton` 获得自己的协议语义。
5. 它会逼迫我们更精确地区分 transient press lifecycle 与 persistent binary value。

选择暂缓 `Tabs` 的主要理由：

1. `Tabs` 的价值很高，但它一次性牵引的未压实面过多。
2. focus roving 细节问题确实适合在 `Tabs` 阶段处理，但最好先通过 `Switch` 完成第二个小型 P 实体闭环。
3. collection/use-style hooks 的最终归类还没有完成，直接做 `Tabs` 容易把 prototype cataloging 与 collection governance 绑死。

---

## 6）暂缓或备选方向

### Toggle

`Toggle` 可以作为 `Switch` 后的对照项。它与 Button 的关系更近，会逼迫我们判断：

- Toggle protocol 是否拥有持久 `pressed`。
- Button 的 `pressed` 是否只能表示 transient press lifecycle。
- Toggle 与 Switch 在外部状态命名、a11y role 和 event signal 上如何区分。

暂不作为下一轮首选，是因为它和 Button 太近，可能不足以检验不同类型组件的 disabled、a11y 与 persistent value 语义。

### Checkbox

`Checkbox` 也适合作为二值/多值状态原型，但它更早牵引：

- `indeterminate`。
- form association。
- checkbox group 语义。

这些问题有价值，但比 `Switch` 更容易拉入 form 与 group 断口。

### Tabs

`Tabs` 保留为后续大步推进对象。它适合在 `Switch` 后用于集中处理：

- roving focus 细节。
- collection/use-style hook 治理。
- composite widget anatomy。
- tablist/tab/tabpanel a11y。
- active value 与 content visibility。

---

## 7）下一步工作

建议下一轮按以下顺序推进：

1. 阅读现有 `base switch` 实现与测试，确认当前行为事实。
2. 对照 ARIA / Open UI / HTML 相关资料，先在对话中讨论 Switch 是什么。
3. 起草 `P-BASE-SWITCH` 准则，不直接一次性落实体。
4. 决定 Switch props 最小面、state/expose/event/a11y/focus/disabled 边界。
5. 落 `P-BASE-SWITCH` 与对应 `T-BASE-SWITCH-*` 测试实体。
6. 将可实践准则跟进到 `base switch` 原型代码，并注明 criteria ID。
7. 迁移或补齐原型测试、runtime/module 测试。
8. 遇到新的断口时，优先记录并逐个压实，不横向追求一次性清零。

---

## 8）非目标

本记录不决定以下问题：

- `P-BASE-SWITCH` 的最终 criteria 文本。
- Switch 是否采用 `checked`、`on`、`selected` 或其他 exposed state 名称。
- Switch outward signal 的最终命名。
- controlled/uncontrolled props 的完整契约。
- Tabs / collection / roving focus 的最终模型。

这些问题需要在 Switch 编目前继续讨论，并由后续 P/C/T/D 实体分别承载。
