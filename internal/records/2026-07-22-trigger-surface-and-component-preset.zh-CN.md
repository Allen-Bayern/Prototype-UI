# 2026-07-22：Trigger surface ownership 与 component preset

> Internal record. Not normative. 本文记录 `0.2.0-rc.1` 之后由仓库外人工消费 Shadcn Dialog 与 Switch 引出的设计讨论。规范语义以相关 `D-*`、`C-*`、`P-*` 与 `T-*` 实体为准。

## 背景

连续嵌套 trigger 已在 #317 中恢复 logical event route 合并，但事件通路正确并不自动意味着宿主只投射一个 focus target 或一个 accessibility semantic object。`DialogClose > Button` 一类结构仍可能让两个原型分别声明 focusability 与 `role=button`。

另一方面，Shadcn Switch 的上游消费面固定包含 Thumb，而 Proto UI 当前只生成独立 Root/Thumb facade，要求 App Maker 在每次使用时重复声明同一默认结构。Dialog Content 的默认 X Close 也属于同类便利结构，但同时涉及独立交互边界、portal 与关闭语义。

## Trigger group 方向

连续 trigger chain 应形成一个 trigger group，并区分：

- behavior owner：最外层连续 trigger，继续拥有统一 activation/event route；
- surface owner：默认取最内层连续 trigger，承担唯一宿主 focus target 与 accessibility semantic object projection。

Focus 与 a11y 不应被 `asTrigger` module 吞并。`asTrigger` 只建立可查询的 group ownership；Event、Focus 与 A11y 分别消费这一事实。Focus facts 可以在 group 成员间共享，使多个原型的 feedback 观察同一 `focused` / `focusVisible` 事实，但宿主 focusability 不得重复。A11y 对相同 role/action 去重；不兼容 role 或不可合并 state 应报告诊断，而不是静默投射多个 control。

## Component preset 方向

Anatomy 继续只观察和验证实际存在的 parts，不创建、移动或补全宿主结构。默认 part 由独立的 component preset/recipe 声明，并由 CLI 或 adapter materializer 在宿主组件创建前解析。

Preset 的默认 part 必须继承 Root 的 materialization context，包括 adapter/runtime identity、项目级 adapter 配置、logical parent tree、registry 与 host meta；不得把“相同配置”实现为最近一次运行状态，也不得在每次 render 时重新 adapt prototype。

每个 replaceable default part 使用三态输入：

1. 未提供：物化 recipe 默认 part；
2. 提供兼容 part：显式 part 替换默认 part；
3. 显式关闭：不物化默认 part。

替换解析必须发生在 materialization 之前。不得先挂载默认 part，再依靠 Anatomy runtime diagnostics 发现显式 part 后卸载。隐藏在不透明用户组件内部的 part 不要求被自动发现；复杂结构必须使用具名 part 输入、显式关闭或 raw facade。

## 验证顺序

1. Shadcn Switch 作为首个 preset：默认生成一个 Thumb，允许兼容 Thumb 替换或显式关闭，并保留 raw Root/Thumb facade。
2. Shadcn Dialog 作为第二个综合验证：Close 回归无视觉样式，Header/Footer 补齐，默认 X Close 由独立交互原型与 preset materializer 组合。
3. Dialog 同时验证 trigger group 的 focus/a11y surface ownership，以及 Root expose method 在 React、Vue、Web Component 宿主中的自然调用。

## 非目标

- 不恢复 Radix-style `asChild`。
- 不让 Anatomy 成为 component composer、service locator 或实例工厂。
- 不把任意宿主后代自动识别为 preset override。
- 不以复制 Root props 代替 materialization context 继承。
