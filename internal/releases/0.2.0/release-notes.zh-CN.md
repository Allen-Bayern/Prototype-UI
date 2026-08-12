# Proto UI 0.2.0

> 稳定版发行说明草稿。Proto UI 0.2.0 正在为 npm `latest` channel 做准备，但尚未发布。在发行证据完成核验前，`0.2.0-rc.7` 仍是可复现的公开试用版本。

Proto UI 0.2.0 将完整的 40-package rc.7 生态 surface 晋升为 0.2 release line 的首个稳定版。它继续遵守全局精确版本规则：应用中的全部公开 `@proto.ui/*` package 都应使用相同的 `0.2.0` 版本。

## 重点内容

### 可执行 package 产物

- 全部 40 个公开 package 通过已评审的 package exports 交付编译后的 JavaScript 与 declaration output，不再把 TypeScript 源码作为 runtime entrypoint。
- Package build、export 校验、原生 Node ESM import smoke、release staging 与 tarball consumer test 复用同一份生成的 `dist` 产物。
- 官方 CLI 会按照自身精确版本安装 Adapter 与 Prototype package，避免 npm channel 或 semver range 混用不同 release train。

### 跨 Adapter 组件协议

- Web Component、React 与 Vue 共享 0.2 候选阶段准入的 Base Button、Toggle、Switch、Tabs、Hover Card、Dropdown Menu、Select、Dialog、Scroll Area、Separator、Textarea、Live Region 与 Async Region surface。
- 连续嵌套的 trigger 组成一个受治理的 trigger group，并明确 anchor、interaction surface、semantic activation route 与 pointer hit boundary。
- 被动 host 不再意外获得 focus surface；Dialog 的 focus loop 与 restoration 继续拥有三 Adapter 覆盖。
- Textarea 使用一个 host-mediated multiline control 协议，覆盖受控/非受控 value ownership、归一化 input/change/IME payload、accessibility projection 与物理 focus access。

### Prototype Library 与 CLI 工作流

- Base、Shadcn、Lucide 与贡献者原创 Neo-Brutalist library 均进入公开发行集合。
- Neo-Brutalist library 包含 Button、Badge、Card、Toggle、Switch、Tabs、Hover Card、Dropdown Menu、Select、Dialog、Scroll Area、Separator、Skeleton 与 Textarea family，并提供一等 CSS preset。
- Shadcn Tabs 默认横向样式对齐固定的 shadcn/ui v4 基线，同时继续明确 Proto UI 的协议所有权。
- Lucide 固定图标 entrypoint 保持可 tree-shake，并保留所需的 Lucide 与 Feather attribution evidence。

### 文档与贡献治理

- 双语文档提供可复现上手、可搜索的 UI library 总览、Pagefind 搜索、跨 Adapter demo 与 information-flow 指南。
- Release assets 包含双语说明、确定性的 40-package BOM、不可变 spec snapshot 及其 checksum。
- 贡献入口记录 DCO sign-off、源码 provenance、AI assistance disclosure，以及针对其他条件均有效但缺少签署提交的 individual remediation 路径。

## 稳定性边界

`0.2.0` 是 0.2 release line 的稳定版，但不等于 v1 兼容性承诺。active 与 draft spec entity 仍是判断语义稳定、验证中、deprecated 或历史状态的权威来源。Draft Scroll 与 Tooltip catalog slice 不会仅因为其可执行 package surface 包含在本次发行中就自动成为稳定保证。

## 升级提示

- 将全部公开 `@proto.ui/*` dependency 精确固定为 `0.2.0`。
- 使用公开 exports 的 rc.7 消费者无需修改 import path。
- 自定义 host integration 应使用 trigger-group capability 命名；deprecated route-owner alias 仅作为迁移过渡。
- Package 内部 `src/*.ts` import，以及假定 npm tarball 包含仓库源码或测试的用法，不属于兼容保证。

## 发版验证

发布前，已评审的准备 commit 必须通过仓库完整 `release:rehearse` 门禁、Agent 投影检查与 clean-diff 检查。发布后将通过独立证据 PR 核验全部 40 个 npm 版本与 `latest` tag、`v0.2.0` commit、GitHub Release assets 和不可变 snapshot digest，之后才能把本版本标记为 active。
