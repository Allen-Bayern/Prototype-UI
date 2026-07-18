# 2026-07-18 外部来源原型库治理记录

> Internal record. Not normative. 本文记录 Proto UI 对 Base、Lucide、Shadcn 以及未来社区风格原型库的身份、来源、P 实体粒度与上游冲突处理原则。稳定规则可在实践验证后提升为 `D-*` 决策实体；本文不替代上游许可证、商标政策或法律意见。

---

## 1）背景

Proto UI 当前维护三类公开原型库：

- `@proto.ui/prototypes-base`：由 Proto UI 定义和拥有的基础协议库。
- `@proto.ui/prototypes-lucide`：消费 Lucide SVG 数据并转换为 Proto UI 原型语法的图标库。
- `@proto.ui/prototypes-shadcn`：参考 shadcn/ui 官方实现并以 Proto UI 协议、adapter 与样式能力重建的组件库。

未来还可能出现 Ant Design、Material 等社区风格原型库。此类实现可能由 Proto UI 社区维护，但不应因为进入 Proto UI 仓库就被描述为对应上游项目的官方实现。

## 2）问题

如果所有公开原型都只按源码文件编目，会出现两个相反的问题：

- Lucide 的上千个 glyph 会制造上千个内容高度重复的 `P-*` 实体。
- Shadcn 的复合组件若只用一个库级实体，又无法表达 Root 与各 anatomy part 在 Base 之上的不同封装和兼容范围。

此外，P 实体属于 Proto UI 的规范治理，但 Lucide 图形数据与 Shadcn 设计/API 来源于外部项目。需要明确“Proto UI 治理自身实现”与“Proto UI 主张上游所有权”不是同一件事。

## 3）当前判断

### 3.1 P 实体治理范围

`P-*` 实体描述 Proto UI 发布的 prototype protocol，并约束 Proto UI 自己维护的实现、测试和文档。外部来源原型仍应进入 P 实体体系，因为它们的 package API、生成方式、adapter 行为与兼容声明由 Proto UI 发布和维护。

P 实体的存在不表示：

- Proto UI 拥有上游图形、设计、名称、商标或原始源码。
- Proto UI 得到上游官方认证。
- Proto UI 可以忽略上游许可证、归属声明或明确反对。

### 3.2 Base

Base 是 Proto UI 的 first-party protocol library。Base P 实体完整描述交互语义、状态、a11y、anatomy、事件与扩展边界，并作为上层原型库可依赖的稳定协议。

### 3.3 Lucide

所有 Lucide 图标共用一个 `P-LUCIDE-ICON`：

- `lucide-icon` / `asLucideIcon` 是 name-based authoring entries。
- `lucide-{name}-icon` / `asLucide{Name}Icon` / `renderLucide{Name}Icon` 是同一协议的生成特化和 tree-shakable projections。
- 单个 glyph 是 catalog data，不是独立 prototype protocol，因此不为每个图标创建 P 实体。

当前实现从 `lucide-static/icon-nodes.json` 读取 SVG node data，并批量重写为 Proto UI `renderer.svg` 语法。这是 Proto UI 当前缺少通用 SVG 资源解析能力时的过渡实现，不改变图形来源。

每次重新生成必须至少记录：

- 上游 package 与精确版本。
- 生成配置。
- 支持的 SVG tag 与 normalization。
- manifest 中的名称、固定导出和动态加载映射。
- 上游许可证与 attribution follow-up。

当前编目基线为 `lucide-static@1.8.0`。该 package 声明 ISC，且其 license text 另列出部分 Feather-derived icons 的 MIT notice。仓库顶层或 package 自身的 MIT 声明不能被解释为覆盖或替换这些上游 notice。

### 3.4 Shadcn

Shadcn 原型按 Base 类似粒度建立 `P-SHADCN-*`：

- 每个稳定 component protocol 一个实体。
- 每个拥有独立协议增量的 anatomy part 单独一个实体。
- Shadcn 可以比 Base 拥有更多 part，因为上层封装允许扩展 anatomy 与 API。

Shadcn P 实体采用 delta-style：

1. 通过一等 `inherits.prototypes` 关系指向对应 `P-BASE-*`，不把原型继承混同为一般依赖。
2. 默认继承 Base 已经保证的交互、状态、a11y 与事件准则，不重复定义。
3. 这种继承可反悔：消费 Base authored asHook 后，上层可以对某个已引入能力施加 setup-only 负向补丁或替换。每一个放弃或修改都必须在上层 P 实体的独立准则中说明被取消的 Base 能力、理由与替代语义；没有明示偏离的 Base guarantee 保持有效。建立计划与取消计划都发生在 setup 期，因此单纯取消通常不为对应能力留下 runtime 分支开销；如果实现依赖 runtime flag 才“取消”行为，它就不是这里所说的 setup 负向补丁。
4. 只描述 Shadcn 在 Base 之上新增或改变的 API、anatomy、视觉规则、组合方式和兼容边界。
5. 明确区分 upstream compatibility target、当前 passing subset、planned gap 与 intentional deviation；同一 P 实体的当前全部 upstream 差异集中维护在一个 open question 中。

“参考官方”必须有可复验基线。实体 source 应尽量固定到上游 tag、package version 或 commit/path；上游更新不会自动改变 Proto UI 当前 guarantee，必须经过同步、测试和 revision 记录。

Shadcn Button 试点使用的上游基线是：

- repository：`shadcn-ui/ui`
- file：`apps/v4/registry/new-york-v4/ui/button.tsx`
- revision：`f31ed81983653919dd4fe77aee4b4859f610f1dc`

### 3.5 `asChild` 是有意不兼容项

Proto UI 不提供 Radix-style `asChild` 兼容 API。trigger 组合应由组件作者声明角色，并由特权 `asTrigger()` 自动合并连续 trigger event route；不应把事件代理、handler 合并或 trigger ownership 转交责任放给组件调用者。

因此：

- 当 Shadcn 或其他 upstream API 包含 `asChild` 时，Proto UI 投射应忽略该参数并声明 intentional deviation。
- 不得仅为了模拟 `asChild` 而扩展 `asTrigger()` 使其选择性停止默认 route 合并。
- 透明 slot、元素替换与 native prop forwarding 是不同能力，不得因为实现了其中一项就宣称与 Radix Slot 或 `asChild` 等价。
- 正式决策实体为 `D-AS-CHILD-OMISSION-0001`，相关 P 实体应引用它并保留独立准则。

### 3.6 社区与潜在官方关系

未来的 Ant Design、Material 或其他风格库默认是 Proto UI 社区维护的非官方实现。只有上游明确认证并就维护责任、名称使用、发布与治理达成方案后，才可以改变官方状态描述。

当来源权利人明确提出归属修正、名称冲突、停止分发或下架要求时，Proto UI 应优先核验并配合上游决定，而不是以本地 P 实体或重写实现为理由对抗。需要下架时，可把实体标记 deprecated/removed 并保留必要的迁移记录；不得删除历史事实来伪装从未分发。

## 4）本轮决定

1. 新增一个 `P-LUCIDE-ICON` 与一个对应 T 实体，不为每个 glyph 建实体。
2. Shadcn 使用 `P-SHADCN-{COMPONENT/PART}`，并通过 `inherits.prototypes` 以 Base P 作为可显式负向补丁的默认继承基线。
3. Shadcn Button 作为 delta-style 编目模版；完成后暂停，验收模版再批量展开。
4. 外部来源、上游版本和非官方状态必须在 record、entity source、README 或生成 manifest 中至少有可追溯入口。
5. 新增 `D-AS-CHILD-OMISSION-0001`，把跨 Shadcn 原型反复出现的 `asChild` 有意不兼容收敛为一次治理决策。
6. 先用 Lucide 与 Shadcn Button 两个不同形态验证治理模型；Shadcn Button 模版验收后再批量展开。

## 5）后续断口

- 是否为 prototype entity schema 增加结构化 `provenance`、`upstreamRevision`、`compatibility` 与 `officialStatus` 字段。
- 第三方 notice 应采用 package-local 文件、仓库总表还是发布阶段自动聚合。
- Lucide 生成器的原始输出与仓库 Prettier 结果目前不是字节幂等；正式 regeneration workflow 应内置格式化或增加 clean-tree check，避免上游同步制造数千个纯格式 diff。
- Shadcn upstream API 中 React/native-specific props 如何映射为跨 adapter Proto UI API。
- upstream deletion、rename 与 breaking change 如何映射到 P entity revision/deprecation。
- 官方认证发生时，维护责任、发布权限与实体治理权如何迁移。
