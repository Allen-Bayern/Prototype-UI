# Tabs P 实体后续收口记录

日期：2026-07-06

## 背景

Tabs P 实体、Focus Entry 与 Focus Roving 的第一轮实现完成后，仍有若干需要在本轮 PR 内或近期工作中收口的断口：

- adapter 在事件归属缺失时的 activeElement fallback 属于 adapter 契约治理缺口，但 A/M/HC 实体尚未系统编目。
- Tabs selection fallback 不应继续完全 deferred，至少应覆盖非受控 root 的基础缺失与 disabled trigger 场景。
- Tabs List 需要可访问名称，但原型 API 不应泄漏 Web 专属的 `aria-label` / `aria-labelledby` props。
- Web Component 之外的 React / Vue adapter 需要补充 Tabs 组合交互验证。

## 决策

1. 新增 `D-ADAPTER-EVENT-OWNER-FALLBACK-0001`，记录事件归属 fallback 是 adapter 侧契约治理缺口，当前只留决策入口，不提前展开 A/M/HC 编目。
2. Base Tabs root 支持非受控 selection fallback：当当前 selected value 缺失或指向 disabled trigger 时，回落到第一个 enabled trigger。受控 Tabs 不擅自改写外部 value；动态删除 selected trigger 仍保留为断口。
3. Base Tabs List 新增宿主中立 `a11yLabel?: string` props input。原型只声明 accessible name 语义，Web host 由 a11y module 投射为 `aria-label`。
4. a11y name/description 支持引用 state handle，以便宿主中立 props 可以动态驱动 semantic object 文本事实。
5. React / Vue adapter 增加 Tabs compound interaction 覆盖，用来验证 context、anatomy、event 与 a11y/state 投射在框架 adapter 下能协作。

## 后续断口

- adapter event owner fallback 的更正式约束应等待 adapter entity、module entity 与 host capability entity 的编目工作推进。
- Tabs duplicate value 的选择与 a11y relationship fallback 仍需单独治理。
- Tabs presence/visibility 与 indicator measurement 仍适合在 Tabs PR 合并后作为近期独立方向推进。
