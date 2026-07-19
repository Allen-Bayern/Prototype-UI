# Proto UI 版本管理策略

> 内部治理文档。本文定义 Proto UI 在 `v0` 与 `v1` 两个阶段中应如何解释版本号，以及维护者应如何向内外部说明跨包兼容性预期。

---

## 1. 本文目的

这份文档用于让 Proto UI 的版本管理对以下角色保持可预期：

- 规划发版的维护者
- 需要跨多个包提交改动的贡献者
- 需要判断哪些版本可以安全组合使用的用户

它本身不是契约规范文档。

它是一份项目治理规则，用来约束版本号应如何使用、如何解释。

---

## 2. 阶段模型

Proto UI 当前只围绕两个产品阶段进行规划：

- `v0`
- `v1`

这两个阶段的含义有意比普通的语义化版本里程碑更大。

### 2.1 `v0`

`v0` 是 Proto UI 的早期公开阶段。

它是公开可用的，但不承诺每一个 minor 版本之间都可以完全自由混用。

在 `v0` 阶段内，Proto UI 仍可能在以下层面引入 breaking change：

- 子 API
- 选项名称或选项语义
- 配置结构
- 跨包协作假设
- 生成结果细节

### 2.2 `v1`

`v1` 是下一阶段的成熟化版本。

从 `v0` 进入 `v1`，预期意味着稳定性承诺增强，但**不**意味着发生一次大范围架构重置。

对 Proto UI 来说，`v1` 应当继续兼容 `v0` 已建立的一阶概念和整体范式。

这意味着：

- 不重新定义一级概念
- 不替换整体模型
- 不把 `v1` 做成“伪装成稳定版的另一套 Proto UI”

---

## 3. 全局精确版本规则

从 `0.2.0-rc.0` 开始，一个数字版本标识一次完整的 Proto UI 生态发行，而不是某个 package 的局部修订计数。

在 `v0` 阶段：

- 所有公开 `@proto.ui/*` package 必须使用完全相同的版本，包括 patch 与 prerelease 后缀。
- package 局部修复进入当前 release train，不独立创造 patch 版本。
- 发布出来的内部 `@proto.ui/*` 依赖使用精确版本，不使用允许自动混合 patch 的范围。
- apps、private spec implementation package 与纯仓库内部 fixture 不属于 npm 锁步发布集合。

版本相同是兼容性的必要前提，但不是 Prototype 与 Adapter 完全兼容的充分证明；完整结论仍需 conformance evidence。

---

## 4. V 实体与仓库投射

每个受治理的版本必须由一个 `V-*` version entity 声明。

- `draft` V 实体表示正在准备、尚未发布的 release train。
- `active` V 实体表示 npm、Git tag 与 spec snapshot 均已有可验证的发布证据。
- 根 `VERSION`、公开 package manifest 与 workspace release list 都是当前 V 实体的投射。
- 任意实体的 `revisions[].version` 不能自行创造新版本；它必须引用已有 V 实体。
- workspace 的可选版本来自 V 实体，而不是扫描所有 revision 数字。

`VERSION` 与公开 package manifest 的一致性使用完整字符串比较。`0.2.0-rc.0` 与 `0.2.0-rc.1`、`0.2.0` 与 `0.2.1` 均属于不同 release。

---

## 5. `0.y.z` 的含义

Proto UI 使用语义化版本号格式，但会对 `0.y.z` 施加额外的项目级约束。

### 5.1 Minor 版本：`y`

`0.y.0` 表示 Proto UI 生态进入一条新的能力线。

当一次发布包含以下任一情况时，应考虑进入新的 minor：

- 明显的用户侧新能力
- 新晋升为 public 的包或能力面
- 跨包行为假设发生变化
- 子 API 或配置预期出现 breaking change
- 需要用户整体协调升级多个包的 release-line 变化

对 Proto UI 的 `v0` 来说，minor 是最主要的生态协同边界。

### 5.2 Patch 版本：`z`

`0.y.z` 的 patch release 应始终停留在同一条 minor 线内部。

Patch 是该 minor 线内部相对安全的升级边界，适用于：

- bug 修复
- 文档修复
- 测试与工具链改进
- 类型修复
- packaging 修复
- 不改变该条 release line 预期行为的小型实现优化

如果某个改动会让用户重新评估“同一条线内是否还能安全升级”，那它大概率不应只算作 patch。

---

## 6. 维护者判断规则

在 `v0` 阶段判断一个改动该归入 patch 还是 minor 时，建议采用以下默认规则：

- 本地修复、稳定性加固，默认进入 `patch`
- 任何会改变生态消费方式的发布，进入 `minor`

如果维护者拿不准，可以先问一句：

“一个谨慎的用户是否会因为这次改动，而需要重新协调整套 Proto UI 依赖的升级方式？”

如果答案是会，那么更应该进入新的 minor 线。

---

## 7. 对外沟通规则

对外 release notes、包文档、安装说明应统一表达以下几点：

- Proto UI 当前处于 `v0`
- 生产环境中，所有公开 Proto UI 包应保持完全相同的版本
- patch 与 prerelease 更新都是完整的生态 release，而不是 package 局部发布
- `v1` 代表更强的稳定性承诺，但不会改变项目的核心架构

我们不应向用户暗示比项目实际能做到更强的兼容性承诺。

---

## 8. 总结

Proto UI 当前的版本管理应被理解为：

- 仅规划 `v0` 与 `v1` 两个阶段
- `v0` 到 `v1` 不发生架构级重置
- 从 `0.2.0-rc.0` 起，公开包采用全局精确锁步
- 数字版本必须由 V 实体声明并对应真实 release 行为
- patch 与 prerelease 都是完整生态发行边界
- `0.1.x` 的历史 package 矩阵属于锁步治理建立前的 legacy history，不补造全局 tag
