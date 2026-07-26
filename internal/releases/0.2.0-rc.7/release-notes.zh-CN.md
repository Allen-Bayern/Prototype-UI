# Proto UI 0.2.0-rc.7（草案）

> 本文记录 `0.2.0-rc.6` 之后拟进入 rc.7 的候选变化。`0.2.0-rc.7` 尚未发布；精确 package 版本、BOM、Git tag、GitHub prerelease 与不可变 spec snapshot 需要由后续 release-train preparation 单独建立并验证。

## 已修正

### 连续 Trigger group 与 Dialog 命中范围

- 连续嵌套的 `asTrigger()` 不再描述为向最外层或最内层 Trigger 单向代理事件，而是合并为一个 trigger group，并明确区分默认最外层 anchor、所有 members、默认最内层 interaction surface 与共享 semantic activation route。
- 每个 member 继续保留自身 behavior 声明；语义 activation registrations 汇聚到当前 surface 的共享 target，`host:*` listeners 仍留在各实例自己的宿主 root。
- Pointer activation 现在只有在原生 hit origin 位于当前 surface root 或其内容中时才会进入 group semantic route。命中 anchor 或其他非 surface member 自身多出来的宿主盒会被拒绝，不再被重定向为 surface activation。
- 这修复了 `ShadcnDialogClose > ShadcnButton` 中外层 Close wrapper 宽于内层 Button 时，点击 Button 旁空白仍关闭 Dialog 的问题；相同规则也覆盖 `ShadcnDialogTrigger > ShadcnButton` 的外层空白。
- Web Component、React 与 Vue 的共享 Dialog journey 现在同时验证：外层 Trigger/Close 空白不触发，内层 Button 的 pointer 与 keyboard activation、focus loop 和关闭后的 focus restoration 继续正常工作。
- 新的 group capability 使用 `mergeGroup` 与 `getGroupEventTarget` 命名；旧 route-owner capability 暂时保留 deprecated alias，便于既有 host integration 迁移。

## 构建与发布

### 37 个公开 package 交付可执行产物

- 全部 37 个公开 `@proto.ui/*` package 现在都会在发布前生成 `dist/*.js` 与 `dist/*.d.ts`，package exports 分别指向 JavaScript runtime 与 declaration output，不再把需要 TypeScript loader 的 `.ts` 源码直接作为 npm runtime entry 发布。
- 每个公开 package 现在都有 package-local `build` 与 `prepack` contract；根级 `build:packages` 按生产依赖拓扑构建所选 package 及其上游闭包，验证全部 export targets，并在不加载 TypeScript 的原生 Node ESM 环境中执行 import smoke。
- Release staging 现在复用并复制开发与 CI 已验证的同一份本地 `dist`，不再维护另一条可能漂移的临时编译路径。
- 公开 manifest 通过生成器统一维护 `dist` exports、`files` 白名单和 build scripts。源码与测试保留为仓库输入，但不再进入默认 npm payload；37 个 tarball 中的测试文件总量由 1,031,558 B 降至 0 B。

### Bundle、文档与 CI 反馈

- Lucide 固定图标入口与全图标 registry renderer 解耦，代表性单图标 `icons/x` 的 gzip 体积由 119,273 B 降至 1,560 B，避免单个图标传递引入完整 registry。
- Lucide Gallery 改为有限首屏服务端渲染，Demo Matrix 改为每个 demo 只挂载一个可切换 adapter 的 previewer；对应英文页面原始 HTML 分别下降约 63% 与 61%。
- CI 现在根据 workspace 生产依赖图计算受影响的公开 package，并为代表性 package entry 固化 gzip budgets；`main` 与手动触发仍执行全量公开包验证。
- 新增可重复的 monorepo analysis snapshot，记录构建、测试、tarball、bundle、文档产物与 package 更新频率，使上述优化可以在相同口径下复查。

## 验证

- Trigger group 改造通过完整工作区测试：239 个测试文件、1,076 个测试通过；prototype catalog、类型检查、Agent 文档生成检查与 Web Component/React/Vue 共享 Dialog conformance journey 通过。
- 构建优化已验证 37/37 公开 package 的完整构建、export target、原生 Node ESM import、release stage 与 `npm publish --dry-run`；package manifest、bundle budget、类型、测试、Astro check 与文档构建门禁均通过。

## 升级提示

- 通过公开 package exports 使用 Proto UI 的消费者无需更改导入方式，但运行时现在会解析到已编译的 `.js`，类型解析到 `.d.ts`。依赖 package 内部 `src/*.ts` 路径或假定 npm payload 包含源码/测试的非公开用法不属于兼容保证。
- 自定义 host integration 应迁移到 trigger-group capability 命名；deprecated route-owner alias 仅用于过渡。

## 仍待发布准备

- 本草案不代表 rc.7 已经形成可安装发行。后续仍需创建 draft version entity、对齐 `VERSION` 与全部公开 package manifest、生成 package BOM，并通过完整 release rehearsal 后才能进入发布评审。
