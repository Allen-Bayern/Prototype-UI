# 2026-07-20 本地 Styled Prototype、Lucide 按需安装与 Style Compiler 方向记录

> Internal record. Not normative. 本文记录 Proto UI 对 Base、Shadcn、Lucide、CLI 本地源码写入、Style token authoring grammar 与构建接入的一次阶段性产品/工程判断。稳定语义仍应提升到 D/P/C/T 实体、CLI 治理、公开文档或独立 Style Compiler 契约；本文不替代这些真相源，也不替代上游许可证。

---

## 1）背景

Proto UI 当前公开三类原型库：

- `@proto.ui/prototypes-base`：稳定交互语义与 headless protocol 基础。
- `@proto.ui/prototypes-shadcn`：在 Base 之上叠加 Shadcn 风格、variant、size 与视觉 rule。
- `@proto.ui/prototypes-lucide`：从 Lucide SVG 数据生成图标 prototype、render helper、manifest 与按图标 subpath。

`0.2.0-rc.0` 的 CLI 默认安装 Adapter/Prototype package 并生成宿主组件 facade。它还能一次性生成 Shadcn theme、扫描 `tw(...)` 并写出针对 `data-pui-style` 的 CSS，但 styled prototype 仍来自 package，用户不能自然拥有和修改组件物料源码。

此前 CLI 记录已经保留以下长期方向：

```text
base prototype = stable behavior kernel, npm dependency
styled prototype = customizable style shell, optional local source
component facade = adapter composition output, generated
```

相关既有记录：

- `internal/records/2026-04-23-v0-cli-onboarding-decision.zh-CN.md`
- `internal/records/2026-07-18-external-prototype-library-governance.zh-CN.md`
- `internal/records/2026-07-19-prototype-family-import-boundary.zh-CN.md`
- `internal/records/2026-07-20-0.2-rc-public-truth-and-attribution.zh-CN.md`

## 2）用户角色分层

当前产品策略区分三类主要作者：

1. **应用开发者**：消费 React/Vue/WC 生成组件，使用宿主原生 props、events、children/slots 和样式入口，不要求学习 prototype authoring。
2. **设计系统/组件物料作者**：维护 styled prototype、tokens、variant、size、anatomy 与视觉 rule；通常是企业体验团队、社区组件库作者或逐渐成为核心贡献者的人。
3. **协议作者**：定义新的交互对象、状态、事件、context、module/host capability 与跨平台语义。

Base 可以保持 unstyled，但不能要求普通应用开发者仅为改变颜色、尺寸或 variant 就理解完整协议层。普通 Quick Start 应优先提供 styled component；Base 更接近官方语义底座和面向专业用户的 headless 产品。

## 3）当前本地化决定

Shadcn styled prototype 的目标默认消费方式是由 CLI 按组件写入用户本地：

- `proto-ui add <host> shadcn-<component>` 最终应默认创建本地 styled prototype 源码。
- 首次 `add` 自动生成可运行的物理 CSS 与样式入口，不要求用户再主动执行一次 token 生成命令。
- Base、Adapter、Runtime、Core、Module 等稳定内核继续使用同一 Proto UI 精确 release version 的 package。
- CLI 生成的宿主 component facade 改为引用本地 styled prototype。
- 用户拥有本地 styled 源码；常规编辑不需要回写 Proto UI 仓库。
- 短期不实现自动覆盖、自动 merge 或“保护”本地文件。
- 后续 `update` 只提供 upstream diff、来源版本与迁移信息，实际修改交给用户或其 Agent 完成。
- Shadcn package runtime consumption 是 `0.2` 既有过渡路径，后续应尽早退出推荐消费方式。

已经发布的 `0.2.0-rc.0` 不追溯改写。在哪一条后续 release train 切换默认行为，取决于本地 Button 垂直切片、自动样式接入和迁移说明是否成立。

`@proto.ui/prototypes-shadcn` 后续是否继续作为模板来源、测试基线或公开源码发行物，不等同于是否继续提供 package runtime consumption；两者可在实施阶段分开处理。

## 4）本地源码的编辑分层

CLI 写入的源码应尽量把常规样式定制与高级协议修改分开，使用户可以渐进学习：

```text
proto-ui/
  prototypes/
    shadcn/
      button/
        button.proto.ts
        button.styles.ts
        index.ts
  components/
    react/
      index.ts
  styles/
    theme.css
    proto-ui.generated.css
  THIRD_PARTY_NOTICES.md
  provenance.json
```

概念边界：

- `theme.css`：品牌色、radius、animation duration 等最常见定制。
- `*.styles.ts`：utility tokens、variant、size 与有限视觉 recipe。
- `*.proto.ts`：Base asHook、props、rule、template 与高级协议组合。
- `components/<host>`：CLI 管理的 facade，不鼓励手改。

具体文件名和拆分粒度仍需用 Shadcn Button 试点验证；“普通样式编辑不必先理解完整 prototype”是稳定目标。

## 5）Proto Style authoring grammar

### 5.1 作者 token 不允许包含 `:`

原型作者直接写入 `tw(...)` 的 Proto Style utility token 不允许包含 `:`。Proto UI 不支持作者写：

```ts
tw('hover:bg-muted');
tw('dark:bg-background');
```

原因不是 CSS 解析限制，而是这种字符串隐含假设了一个通用 `hover`、`dark` 或其他状态来源。Proto UI 要求作者提供正确的语义来源，并通过 rule 等结构清楚表达：

```ts
def.rule({
  when: (query) => query.state(hovered).eq(true),
  intent: (intent) => intent.feedback.style.use(tw('bg-muted')),
});
```

Rule 的作用之一是让状态来源和视觉 intent 在运行时成为系统可读结构。Adapter 可以读取 rule 语义并进行优化，从而在 adapter 架构中获得过去常被认为只有静态 compiler 才能完成的优化机会。Proto UI 不通过 style token 字符串推测交互状态机。

### 5.2 作者语法与最终产物相互独立

作者 token 不含 `:`，不表示最终产物永远不含 `:`。当前 Web 优化可能把 rule 条件与基础 utility 降低为类似 Tailwind variant 的内部 selector-qualified key，例如带 `data-[…]:` 或 `dark:` 的序列化产物。

这是预期行为，当前不计划为了让最终产物长得像作者语法而改造。需要明确区分：

- **Author token**：作者声明的、无状态假设的 utility token。
- **Rule semantics**：状态、props、meta 与其他条件来源。
- **Internal lowering**：Adapter/Style Compiler 根据宿主能力选择的优化形式。
- **Host projection**：DOM attribute、内部 style table、原生平台 style handle 或其他系统可读载体。

内部 lowering 是否包含 `:`、是否进入 `data-pui-style`、是否对开发者可见，都不是 authoring grammar 的保证。

最终带 `:` 的产物也不是必然出现：

- 当状态拥有稳定 Web attribute 抓手时，Adapter 可以生成 selector-qualified 静态优化。
- props 默认不会投射为 DOM attribute；props 驱动条件没有宿主抓手时，可能保留 runtime token application，而不生成带 props 条件的静态 token。
- 非 Web 宿主不必把 style token 暴露在元素 attribute 上，甚至可以完全使用内部 style table 或平台原生结构。
- Style token 产物只需要保证系统可读；对开发者可见有时只是调试价值，也可能成为噪音。

因此，不应把 DOM 中的当前 `data-pui-style` 字符串形状提升为跨宿主协议，也不应让作者依赖内部 lowering 的命名。

### 5.3 动态 token 边界

Proto UI 应提供固定、可分析的动态 style 表达方式；作者不得用字符串拼接模拟动态 token：

```ts
tw(`bg-${color}`);
```

此类写法应产生诊断，并提示作者改用：

- 有限枚举的 token map。
- 明确 props/state/meta 来源的 rule。
- Proto UI 正式提供的动态 token 语法。

具体动态 token grammar 仍需后续契约化，但“不得靠任意字符串构造隐藏语义”是当前边界。

## 6）Style Compiler 方向

将现有 CLI 中的 token 提取和 CSS 生成提升为一个可复用 Style Compiler 核心。CLI 与构建工具只做接入，不复制 grammar 和 emitter：

```text
local prototype source / package manifest
                  -> Style Compiler
                     -> physical CSS
                     -> diagnostics
                     -> token/style manifest
```

当前目标：

- AST 识别从 Proto UI style API 导入的 `tw` binding，而不是任意同名函数。
- 不把扫描范围绑定到 `.proto.ts` 后缀，因为 token 可以抽到 `*.styles.ts`。
- 支持有限字符串常量、数组、对象 map 与可判断 import；不执行用户源码。
- 根据 rule/adapter 能力生成或保留宿主相关 lowering。
- 生成确定性的物理 CSS 文件，供应用显式 import。
- 首次 `add` 自动产生可用 CSS。
- 提供 CLI `build/watch/check` 形态。
- Vite/Astro 作为第一个自动增量与 HMR 接入；Webpack/Rollup 后续复用同一核心。
- production build、CI 与 dev 使用同一 grammar 和 emitter。
- 公开 Style Compiler 若使用 `@proto.ui/*` scope，则在 v0 遵守全局精确版本锁步。

当前 `packages/cli/src/services/proto-style-css.ts` 与 legacy AST scanner 是可行性基础，不直接等同于最终 public compiler。

## 7）诊断策略

未知或不可静态解释的 author token 应产生 error，而不是只写入生成 CSS 注释。

按环境区分阻塞行为：

- Dev/watch：报告带文件、行列和建议的错误；服务可以继续运行并保留最后一次成功 CSS。
- `styles check`：返回非零状态。
- Production build：阻塞，避免发布缺少样式的组件。

诊断至少应说明：

- token 与源码位置。
- 当前支持的 grammar 范围。
- 是否疑似使用了含 `:` 的状态字符串。
- 是否疑似动态拼接。
- 推荐改用 rule、有限 token map 或正式动态语法。

## 8）物理 CSS 与自动接入

当前选择物理 CSS 作为用户可见输出，以便：

- import 顺序显式。
- SSR、测试与 production build 可检查。
- 生成 diff 可审计。
- 不依赖某一个 bundler 的 virtual module 语义。

普通用户不应手动运行额外脚本才能得到第一次正确样式：

- `init/add` 立即生成初始 theme 与 token CSS。
- Vite/Astro 接入在本地 styled source 改动时自动重新生成并触发 HMR。
- 非受支持 bundler 至少拥有 CLI watch/build fallback。

插件是直接写物理文件、调用独立 watch service，还是通过其他方式保证文件更新，保留为实施 open question。

## 9）Shadcn/Lucide provenance 与 attribution

源码写入用户项目后，package-local notice 不再足够。CLI 应在本地维护可审计的聚合声明，例如：

- `proto-ui/THIRD_PARTY_NOTICES.md`
- `proto-ui/provenance.json`

每次 `add` 幂等记录：

- 来源项目与非官方状态。
- 上游 package/version 或固定 repository revision/path。
- 许可证与 notice。
- Proto UI 模板/release version。
- 写入的本地文件。

Shadcn 与 Lucide 使用不同的上游声明，但复用同一 provenance/notice 管理机制。用户删除或迁移文件时如何回收无用 notice，可以后置；不得因为难以自动回收就省略首次 attribution。

## 10）Lucide 独立安装断口

当前 `@proto.ui/prototypes-lucide` 已有 `./icons/*` subpath，可让 bundler tree-shake 单图标运行时代码，但 npm 安装仍下载整个 package。CLI 也尚无 Lucide add 项。

未来目标是参数化命令，而不是手写几千个 registry 白名单：

```text
proto-ui add lucide check
proto-ui add lucide search
```

CLI 使用版本化 manifest：

1. 校验 icon name。
2. 取得对应的固定 prototype/render helper 与必要共享文件。
3. 只写入请求的图标源码和本地 index。
4. 更新 provenance 与 Lucide/Feather notices。
5. 重复 add 保持幂等。

如何按图标取得源码仍是独立 open question：

- CLI 携带全量模板会增大 CLI。
- 安装全量 Lucide prototype package 再复制，不能减少下载体积。
- 远程 registry 需要可用性、版本固定和 integrity 设计。
- 从 `lucide-static` 本地生成会引入上游依赖与生成器治理。

Lucide 不阻塞 Shadcn Button 本地化与 Style Compiler 第一切片。

## 11）当前不做

- 不要求普通应用开发者学习完整 prototype authoring 才能改样式。
- 不直接安装 Tailwind，也不把 Proto Style grammar 委托给 Tailwind 扫描器。
- 不支持作者用含 `:` 字符串声明状态来源。
- 不把当前 Web `data-pui-style` 形状提升为跨宿主 authoring contract。
- 不在构建阶段执行任意 prototype setup 来发现 token。
- 不在第一版实现自动合并或覆盖用户本地 styled source。
- 不为每个 Lucide icon 手写 CLI registry entry。
- 不同时从零开发 Vite、Webpack 与所有 bundler 插件。

## 12）工作顺序

1. 先用当前 `0.2.0-rc.0` package 模式完成外部 React API/样式消费基线。
2. 抽离 Style Compiler 核心与严格诊断。
3. 为 Shadcn Button 设计本地 style/prototype 文件结构。
4. 实现默认本地 add 的最小垂直切片与物理 CSS 初始生成。
5. 提供 Vite/Astro 自动增量和 HMR 接入。
6. 在外部 React Lab 比较 package 基线与 local 模式。
7. 用一个官网 Starlight/Web Component 切片验证消费者墙和样式接入。
8. 再扩展到复合 Shadcn family、Vue、WC 与 update diff。
9. 单独设计 Lucide manifest 驱动的按图标安装与来源传输。

## 13）Open questions

- 哪一条 release train 正式把 Shadcn local 设为默认并退出 package runtime 推荐路径。
- `@proto.ui/prototypes-shadcn` 是否继续作为模板/测试/源码发行物。
- 本地 `*.styles.ts` 与 `*.proto.ts` 的最小稳定拆分方式。
- 物理 CSS 是否提交 Git，以及插件、watch service 与 build script 的职责分界。
- Rule internal lowering 的结构化 manifest 与当前 AST 分析如何分工。
- 正式动态 token grammar 与有限枚举表达。
- Update diff 需要保存哪些 base hash、template revision 与本地修改信息。
- Lucide 单图标源码的版本化传输方式。
- 非 Web adapter 如何消费相同 visual intent，同时避免把 CSS utility 当成跨平台事实。

## 14）后续提升目标

稳定内容应分别提升到：

- CLI add/update 与本地文件所有权治理。
- Proto Style authoring grammar 的 D/C/T 实体。
- Rule → style lowering 与 adapter conformance tests。
- Shadcn/Lucide P 实体的 distribution/provenance criteria。
- Style Compiler public API、诊断和 bundler integration 文档。
- 官网“构建 styled library”和 Quick Start 的消费模式说明。
