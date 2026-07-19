# Proto UI CI/CD 使用说明

本文说明仓库内 GitHub Actions 工作流的职责，以及它们与全局精确版本和首发 package 治理的关系。

当前 release train 为 `0.2.0-rc.0`；发布日期尚未固定。

## 工作流总览

| 工作流 | 文件 | 作用 |
| --- | --- | --- |
| CI | `.github/workflows/ci.yml` | PR 与主干的类型、测试、spec 和全局版本门禁 |
| Release Packages | `.github/workflows/release-packages.yml` | 手动执行 release scan、stage 彩排或全量发布 |
| Release Cadence | `.github/workflows/release-cadence.yml` | 定期检查距最近 `v*` release 的时间并提醒维护者 |

## CI 工作流（`ci.yml`）

CI 在 pull request、`main` push 和手动触发时运行。除常规类型与测试外，它会执行 `check-version-governance`，确保：

- 根 `VERSION` 与全部公开 `@proto.ui/*` package 精确一致
- 当前版本有且只有一个对应的 V 实体
- `0.2.0-rc.0` 起的实体版本引用来自已声明 V 实体
- launch governance 的 release line 与当前版本一致

任何新数字版本都必须先成为受评审的 release train，不能通过局部 package 改版绕过。

## 发布工作流（`release-packages.yml`）

该工作流仅通过 `workflow_dispatch` 手动触发。

### 关键入参

- `mode`：`scan` / `stage` / `publish-all`
- `profile`：`workspace` / `launch`
- `include_approved_candidates`：仅影响 launch 审计集合
- `resume_published`：仅用于部分发布恢复；只跳过 integrity 完全相同的已发布 tarball
- `publish_delay_ms`、`max_publish_retries`、`retry_delay_ms`：npm 限流保护参数

工作流不接受临时 `version`、`tag` 或 `only` 输入。版本和 dist-tag 均来自已评审的仓库状态：prerelease 使用 `next`，stable 使用 `latest`。

### 安全规则

- `publish-all` 仅允许在 `main` 上运行。
- `publish-all` 必须使用 `workspace` profile；`launch` 只用于产品范围审计和彩排。
- 真实发布由 GitHub `npm` environment 审批与 npm Trusted Publishing OIDC 保护。
- 同一 ref 上启用并发互斥，避免重叠发布任务。
- 全部公开 package 发布成功后才创建 `v<version>` tag。

## Launch 治理与发布集合

`internal/governance/launch-package-governance.json` 定义首发产品承诺、文档和 smoke 的优先级。

- `--profile launch` 根据该文件检查首发承诺包和候选包。
- `--include-approved-candidates` 只扩展 launch 审计集合。
- `--check-governance` 检查 workspace package 是否全部完成分层。

这套分层不控制真实 npm 发布集合。全局精确版本策略要求 `workspace` profile 一次发布全部公开 `@proto.ui/*` package。

## 建议发版流程

1. 创建或更新 draft V 实体，并在 PR 中统一 `VERSION` 与 package manifests。
2. 运行 `pnpm check:release-version` 与 `pnpm release:scan:launch`，审阅首发产品范围。
3. 运行 `pnpm release:stage`，彩排全部公开 package 的最终 tarball。
4. 合入 `main` 后，用 `workspace` profile 运行 `publish-all`。
5. 发布成功后核对 GitHub release/spec snapshot 证据，再通过后续 PR 将 V 实体转为 `active`。

## 本地快捷命令

- `pnpm check:release-version`
- `pnpm release:scan:launch`
- `pnpm release:stage:launch`
- `pnpm release:stage`

仓库不提供局部真实发布快捷命令；package 局部修复进入下一次全局 release train。
