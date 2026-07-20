# Proto UI 发版工作流

> 内部治理文档。本文定义从 `0.2.0-rc.0` 开始的全局精确版本准备、验证、发布与证据回填流程。

## 1. 权威状态

`main` 是 release tag 与真实发布的唯一来源。日常工作使用短期 topic branch 和 PR；仓库不再依赖长期 `feat/v0-release-prep` 分支承载发行身份。

一次 release 由以下事实共同识别：

- 一个 `V-*` version entity
- 根 `VERSION`
- 全部公开 `@proto.ui/*` package 的精确版本
- `v<version>` Git tag
- npm dist-tag 与已发布 package 集合
- 对应 spec snapshot 与 digest

其中任一事实不一致，都不能宣称 release 完成。

## 2. V 实体生命周期

### 2.1 Draft

维护者决定进入新 release train 时，先创建或更新一个 `draft` V 实体。它固定：

- exact semver，包括 prerelease 后缀
- Git tag，例如 `v0.2.0-rc.0`
- npm dist-tag；prerelease 使用 `next`，stable 使用 `latest`
- `packageVersionPolicy: exact`
- 公开 package scope

`VERSION` 与全部公开 package manifest 必须在同一 PR 中投射为该版本。实体 revision 可以引用 draft V 版本，但 workspace 必须把它明确标为 draft，不能表现成已发布版本。

### 2.2 Active

只有在 npm package、Git tag 与 spec snapshot 已发布后，V 实体才能转为 `active`。Active V 实体必须记录：

- 发布时间
- 40 位发布 commit SHA
- `sha256` spec snapshot digest

## 3. 准备流程

1. 从最新 `main` 创建 topic branch。
2. 创建 draft V 实体并更新 `VERSION`。
3. 使用 `stamp-version` 将全部公开 package 精确对齐。
4. 更新 release note、package BOM、spec snapshot 与治理映射。
5. 运行版本治理、spec、类型、测试、release scan 和 tarball consumer smoke。
6. 通过 PR 评审后合入 `main`。

官网主 Quick Start 始终跟随 npm `latest`，不得把普通使用者静默切换到预发布版本。独立的 prerelease trial 页面必须固定到 V 实体声明的精确版本，以便复现验证；`@next` 可以作为便利 channel，但不是试用记录的版本身份。CLI 在安装 Adapter 与 Prototype package 时，必须把 package spec 固定为 CLI 自身的精确版本并以 exact dependency 写入 consumer manifest；不得让未标注版本的 `latest` 或自动扩张的 semver range 混入其他 release train。

普通 package 局部修复不会使用 `publish-single`。它进入下一次全局 release train。

## 4. 发布流程

真实发布只允许从 `main` 手动触发，并由 GitHub `npm` environment 审批保护。

发布 workflow：

1. 从仓库读取 `VERSION`，不接受临时版本覆盖输入。
2. 执行 `check-version-governance` 与 launch governance scan。
3. stage 全部公开 package，并将 workspace dependency 改写为同一精确版本。
4. 使用 V 实体声明的 npm dist-tag 发布整个 package set。
5. 全部 package 发布成功后创建 `v<version>` tag。
6. 生成 GitHub prerelease/release 与 spec snapshot artifact。
7. 通过后续证据 PR 回填发布时间、tagged commit 与 snapshot digest，并将 V 实体转为 active。

发布 workflow 不直接改写 `main` 中的 V 实体。这样 tag 始终指向发布前已经评审的 draft release identity，而 active 状态作为发布后可复核事实进入下一次 PR；V 实体记录的 snapshot digest 指向 tag 所附的 immutable draft snapshot，避免 snapshot 自身包含 digest 所造成的循环。

若中途发生部分发布，禁止提升 dist-tag 或创建完成态 V 实体。恢复时仍运行完整 workspace release set，并显式启用 `resume_published`；工作流只会跳过 npm registry 已存在且 SHA-512 integrity 与当前 staged tarball 完全相同的 package，未发布 package 继续使用同一版本发布。任一 integrity 不一致都会中止恢复，实际 registry 状态必须进入恢复记录。

## 5. 首个统一版本

首个进入本流程的版本为：

- version：`0.2.0-rc.0`
- Git tag：`v0.2.0-rc.0`
- npm dist-tag：`next`

历史 `0.1.x` package 版本属于全局锁步建立前的 fragmented releases。最高局部版本 `@proto.ui/cli@0.1.4` 不构成全局 `v0.1.4`，不得补造该 tag。

## 6. 必须通过的检查

- `pnpm check:release-version`
- `pnpm release:scan:launch`
- `pnpm release:stage`
- spec workspace 0 issue
- 全仓类型与测试
- 当前源码 tarball consumer smoke
- Quick Start 与实际安装命令一致

纯文档或内部 app 的变化可以不立即触发 release；但一旦创建新的数字版本或修改 `VERSION`，就必须通过上述 release train 流程。
