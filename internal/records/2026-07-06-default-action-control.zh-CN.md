# Default action control 的边界整理

日期：2026-07-06

## 背景

Tabs 编目后，`base-tabs-trigger` 中仍存在直接调用 `ev?.detail?.preventDefault?.()` 的逻辑。进一步检查后发现，这不是 Tabs 独有问题：

- Button / Switch / Checkbox / Toggle 通过 Space 激活时，需要取消宿主默认滚动行为。
- Dropdown / Select / Tabs 的 roving focus 通过方向键、Home、End 移动时，需要取消宿主默认滚动或光标移动行为。
- Focus Scope 的 Tab trap 已经在 focus module 内部做了类似处理。

因此，`preventDefault` 不应继续被视作 prototype 可以直接依赖的 Web 细节。它应被整理为 Proto UI 的 default action control 能力：原型或基础模块可以请求取消本次交互的宿主默认动作，由 adapter/host-cap 决定如何投射。

## 决策

1. Default action control 与 boundary 分离。
   - boundary 回答交互样本属于 inside / outside / unknown。
   - default action control 回答本次交互的宿主默认动作是否应继续。
   - 二者都属于 interaction policy 基础设施，但不能合并为同一语义。

2. Web `preventDefault()` 只是 default action control 的一种宿主投射。
   - Proto UI 内部应通过 host capability 请求默认动作取消。
   - Web adapter 可以把该请求投射为 `nativeEvent.preventDefault()`。
   - 非 Web 宿主可以提供等价能力、诊断能力，或在能力缺失时 no-op。

3. v0 阶段该能力先不暴露给 prototype author。
   - 原型作者不应直接写 `def.defaultAction.prevent()` 之类 API。
   - 先由 `asTrigger`、`asFocusRoving`、`asFocusScope` 等基础能力消费。
   - 组件原型中直接调用 `ev.detail.preventDefault` 的逻辑应逐步收敛。

4. Event payload 可以保留兼容形态，但应引入宿主无关的请求方法。
   - 内部命名优先使用 `requestDefaultPrevented()`。
   - 旧的 `preventDefault()` 可作为 Web 兼容 alias 暂留，但新实现不应继续依赖它。

## 初始牵引范围

- activation：Space 键激活按钮类组件时取消默认滚动。
- roving：方向键、Home、End 触发集合内焦点移动时取消宿主默认动作。
- scope：Tab trap 继续作为 focus module 的内部 consumer。

## 后续断口

- 是否需要独立 `module-default-action` 暂不决定；当前可以先作为 event host-cap 与 event payload control 能力落地。
- `asCollection` 编目后，roving focus 的集合发现机制应进一步从 prototype helper 下沉。
- 对非 Web 宿主的 default action control 能力分级需要在 host capability 编目更成熟后细化。
