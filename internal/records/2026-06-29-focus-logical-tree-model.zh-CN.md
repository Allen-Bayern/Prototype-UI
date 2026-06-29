# 2026-06-29 Focus 逻辑树模型讨论记录

> Internal record. Not normative. 本文记录 Button 主线继续推进前，对 Proto UI focus model 的阶段性讨论结论。

---

## 背景

此前 focus 相关实现已经能提供 `asFocusable()`、`asFocusScope()`、`asFocusGroup()` 等能力，但人工验证中暴露出 focusScope / focusGroup 的焦点管理不够牢靠。直接把 `focused`、`focusVisible` 等事实写成契约，会过早落到工程实现与历史迁移，而没有先说明 Proto UI 的 focus 体系到底是什么。

本记录用于收敛一个更基础的问题：Proto UI 的跨平台 focus 系统应如何组织。

## 当前结论

Proto UI 的 focus 不应被定义为某个 state、event、adapter capability 或单个 asHook。

更合适的定义是：

> Focus 是宿主协同的逻辑交互目标管理域，用于决定当前哪个逻辑节点、范围或同级集合可以接收主导交互意图，以及焦点请求、事实、导航、恢复与约束如何协同。

因此 focus domain 至少包含：

- focus facts：`focused`、`focusVisible`、`focusable`、`active`、`hasFocused` 等观测结果；
- focus requests：`focusSelf()`、`blur()`、`focusFirst()`、`restoreFocus()` 等请求；
- focus eligibility：节点是否可被 focus，是否 disabled，是否参与导航；
- focus topology：focus node、scope、group/roving 集合的逻辑关系；
- focus policy：entry、restore、trap、loop、orientation、directional navigation 等策略。

## 逻辑树优先

Proto UI 的 focus topology 应优先依赖 host logical parent/child 建立。

原因：

- 这与 context、anatomy 已经使用的逻辑 parent/child 同源；
- 它比 DOM containment 更适合跨 adapter、portal、overlay 与组合原型；
- 它允许 focus 系统表达“逻辑上属于某个 scope/group”，而不是只追随宿主节点物理嵌套；
- 它降低作者手工传递 token/key 的负担。

阶段性规则：

- focus root/scope/group/member 关系以 logical parent chain 作为默认解析基础；
- anatomy/collection 可作为顺序、角色、item metadata 的补充来源；
- key/token 保留为 escape hatch 或兼容机制，但不应成为主模型；
- host DOM focus 只是 adapter 落地方式，不是 Proto UI focus model 本身。

## asHook 能力切分

### asFocusable

`asFocusable()` 表示当前原型实例是一个 focus target。

它应主要负责：

- 注册 focus node；
- 暴露 target-level facts：`focused`、`focusVisible`、`focusable`；
- 提供 target-level requests：`focusSelf()` / `blur()`；
- 管理 target-level eligibility：disabled、can request focus、是否参与普通 focusability。

它不应主要负责：

- roving cursor；
- group navigation；
- scope entry / restore / trap；
- next / previous target resolution。

### asFocusScope

`asFocusScope()` 表示一个 focus coordination boundary。

它应主要负责：

- entry policy；
- restore policy；
- trap / contain；
- scope-level facts：active、hasFocused、focusWithin；
- scope-level requests：focusFirst、focusLast、restoreFocus；
- 记录上一次 active child。

它不应把所有同级 item 导航规则吸进来。

### asFocusRoving

同级导航应从 scope 中拆出。

`asFocusRoving()` 是这层能力的作者 API。旧 `asFocusGroup()` 曾表达较弱的焦点分组与局部导航规则，但它与 roving focus 的职责高度重合，因此不再保留为单独作者 API。

- arrow navigation；
- orientation / loop；
- active cursor；
- disabled item skipping；
- selected/current item entry；
- collection/anatomy order integration。

## 当前实现调整方向

现有实现仍包含 `scopeKey`、`groupKey`、`navParticipation` 等 key-based API。短期不要求一次性删除，但实现应开始从 key-first 转向 logical-tree-first：

- focus center 应能通过 logical parent chain 解析 nearest focus group provider；
- focusable item 不应必须显式传 `groupKey` 才能被最近的 logical group 收编；
- `groupKey` 继续保留为兼容过滤或 escape hatch；
- 后续再讨论 `scopeKey`、`groupKey`、`navParticipation` 是否应从 `asFocusable` 的稳定 surface 中移出。

## 下一步

1. 先让 focus center 支持 logical parent/child membership。
2. 用 runtime contract 覆盖“无 groupKey 的 focusable 被最近 logical group provider 收编”。
3. 将作者 API 从 `asFocusGroup` 收敛为 `asFocusRoving`，底层兼容类型后续再逐步重命名。
4. 最后再落正式 `C-FOCUS-*` / `C-AS-FOCUSABLE-*` spec entity。
