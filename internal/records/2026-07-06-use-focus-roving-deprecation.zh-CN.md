# useFocusRoving deprecation 与后续迁移路线

日期：2026-07-06

## 背景

`useFocusRoving` 是早期 base prototypes 内部使用的 anatomy/expose 型 helper。它通过读取 collection item exposes、生成 `focusFirst` / `focusLast` / `focusNext` / `focusPrev` / `focusCurrent` 等方法，并由 item/trigger 原型监听键盘事件后手动调用这些方法来完成 roving movement。

随着 `asFocusRoving()` 成为 focus domain 的 no-arg privileged asHook，并且 focus module 已经能拥有方向键、Home、End 的导航解释与 default-action control，`useFocusRoving` 与当前 `asFocusRoving` 在职责上发生重叠。继续长期保留两套 roving 所有权模型，会让原型作者难以判断导航到底属于 focus module、collection helper，还是具体 trigger/item。

## 决策

1. `useFocusRoving` 进入 deprecated compatibility helper 状态。
   - 它不是长期的 roving focus 抽象。
   - 新编目或已编目的原型不应新增对它的依赖。
   - 新的 sibling-local keyboard navigation 应优先使用 `asFocusRoving()` 与 focus module。

2. 移除窗口依赖消费方迁移。
   - 当前仍有 Select / Dropdown 依赖 `useFocusRoving` 暴露 focus methods，并由 item/trigger 转发键盘导航。
   - 在 Select / Dropdown 的 P 实体与实现完成 focus roving 收口后，可以删除 `useFocusRoving`。
   - v0 小版本不承诺互相兼容，因此该 helper 可在 0.2 或 0.3 直接移除。

3. 迁移方向。
   - collection / anatomy 仍可负责 item membership 与 order projection。
   - focus movement、orientation、loop、Home/End、default-action control 必须归属 `asFocusRoving()` / focus module。
   - 具体 trigger/item 保留 activation、selection request、disabled gating 与组件状态同步。

## 后续顺序

当前 PR 合并后，建议单独推进 Presence / Visibility 方向；之后再处理 Select / Dropdown roving 收口，并在消费方迁移完成后移除 `useFocusRoving`。

## 0.2 完成记录（2026-07-17）

Dropdown Menu 与 Select 均已迁移到 `asFocusRoving()`。`useFocusRoving` 的实现文件与公开导出已经删除；当前原型代码不再消费该 helper。历史名称只保留在本记录与相关决策实体中，用于说明迁移原因并阻止回归。
