# 2026-06-30 A11y Module Planning for Button Cataloging

> Internal record. Not normative. 本文记录 `P-BASE-BUTTON` 编目前暴露出的 accessibility module 计划，不直接替代正式 `C-*` / `D-*` 实体。

## 背景

Button 的原型契约需要较早处理 accessibility：

- Button 需要可映射到 button role 的语义。
- Button 需要 accessible name。
- Button 可能需要 description、disabled reason、tooltip 等辅助表达。
- 这些能力不适合全部塞进 Button props，也不适合长期依赖 adapter 自行猜测。

因此，accessibility 很可能需要成为一个顶层原型作者 API，与 `def.rule` 类似，通过 `def.a11y` 访问。

## 暂定方向

1. Accessibility 应作为顶层 module / channel 进入系统编目，工作名为 `a11y`。
2. 原型作者侧入口暂定为 `def.a11y`。
3. `def.a11y` 应服务跨原型的 accessibility 需求，而不是 Button 私有 API。
4. Button 第一版 P 实体只要求可访问语义与 accessible name，不提前固化 `def.a11y` 的最终 API 形状。
5. Button 的 `label` 是否成为 props，需要等 `def.a11y` 的形状讨论后再决定。

## 可能能力

候选能力包括：

- role / semantic role mapping
- accessible name
- accessible description
- disabled reason
- required / invalid / described-by 类语义
- 与 host ARIA、native accessibility API、adapter output 的映射边界

## 与 Button 的关系

Button 契约可以先写：

- Button 必须具备可映射到 button role 的可访问语义。
- Button 必须支持 accessible name。
- Button 的 accessible name 可来自内容、显式 label 或 accessibility API。

但 Button 契约暂不决定：

- 是否存在 `label?: string` props。
- `def.a11y` 的 API 命名、生命周期与类型。
- ARIA description、disabled reason、tooltip 是否作为 Button core props。

## 后续工作

1. 起草 a11y module 的 scope record。
2. 比较 WAI-ARIA、HTML accessibility mapping 与 Open UI 对常见控件语义的描述。
3. 决定 `def.a11y` 是否作为顶层 DefHandle API 进入 v0。
4. 回到 `P-BASE-BUTTON`，补充或调整 accessible name / description / disabled reason 准则。
