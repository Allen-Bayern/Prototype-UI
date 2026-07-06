# asCollection 编目与 focus roving 关系

日期：2026-07-06

## 背景

Tabs / Select / Dropdown 都需要处理一组同域 item 的动态插入、移除、渲染顺序、index/total/first/last 与 item metadata。现有实现通过 `useCollection` / `useCollectionItem` 完成这部分工作，但它们仍是 `defineHook` 风格的参数化 hook，且早期记录中一直把 collection structural projection 视为 privileged 能力。

同时，Tabs 的 focus roving 暴露出另一个问题：focus roving 与 collection 高度重叠，但不完全相同。Focus roving 有时需要纳入非 Proto UI 的宿主可聚焦元素；collection 则应只描述 Proto UI 主动声明的 collection item。

## 决策

1. `asCollection()` 与 `asCollectionItem()` 应成为 no-arg privileged asHook。
   - 它们通过 `definePrivilegedAsHook` 定义。
   - 配置必须通过返回 handle 的 `configure(...)` 完成。
   - 旧 `useCollection` / `useCollectionItem` 可作为迁移 wrapper 暂留，但不应作为最终治理形态。

2. Collection provider 与 collection item 分别建模。
   - `asCollection()` 声明当前实例是 collection provider。
   - `asCollectionItem()` 声明当前实例是 collection item。
   - 主动指定谁是 item 是 collection 语义的关键部分，不应被 roving 或宿主查询隐式吞掉。

3. Collection 只覆盖 Proto UI 主动声明的 item。
   - 它不负责通用宿主 descendant focus query。
   - 它不负责所有可聚焦元素发现。
   - 它不负责 selection、active item、keyboard policy 或 a11y pattern。

4. Focus roving 不强依赖 Collection。
   - Focus roving 与 Collection 共享 ordered candidate/member projection 问题域。
   - Focus roving 可以消费 collection，但也可以从 focus registration、host focus query 或显式候选集形成 roving candidates。
   - 不应为了 roving 的宿主可聚焦元素场景把 collection 扩张成通用 focus query。

## 初始实现范围

第一轮只迁移现有 `useCollection` / `useCollectionItem` 等价能力：

- provider exposes count / item snapshots。
- item exposes index / total / first / last / snapshot。
- 顺序来自 anatomy order。
- item metadata 由 item 配置提供。
- 动态重排和 transient missing anatomy policy 保持现有行为。

Focus roving 的可选 collection integration 暂不在第一轮强推，后续单独设计。
