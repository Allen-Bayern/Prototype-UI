# 2026-07-19 Prototype family import boundary 记录

> Internal record. Not normative. 本文记录 React release consumer smoke 暴露出的原型库误打包现象，以及 `0.2` 阶段采用的 family 级消费边界；正式 package 承诺以治理文档、package exports 和 CI 为准。

## 1）背景

首份 React + Vite release consumer smoke 的 production build 约为 561 kB、gzip 约 150 kB。拆分后，React runtime 约占 194 kB，Proto UI 约占 347 kB，fixture 自身可以忽略。

进一步比较发现：只消费 Shadcn Button 时，bundle 仍接近当前 Button、Switch、Select、Dialog 四个 family 的完整示例。原因不是 Button 本身拥有这些行为，而是 Base 与 Shadcn package 只公开根 barrel，且 Shadcn 实现统一从 Base 根入口导入；bundler 因此无法稳定地把未消费 family 排除在 module graph 之外。

Adapter 消费路径会同步带入 runtime 与完整 Module 集合。这是当前 Adapter 架构的既有成本，不属于本轮优化范围。`0.2` 不尝试按需装配 Module，也不以 Adapter 路径 bundle 大小作为发布门禁。

## 2）消费粒度

Base 与 Shadcn 的 npm 安装、版本和发布单位仍是完整 package：

- `@proto.ui/prototypes-base`
- `@proto.ui/prototypes-shadcn`

公开 import 的推荐最小单位改为 anatomy family，例如：

- `@proto.ui/prototypes-base/button`
- `@proto.ui/prototypes-base/select`
- `@proto.ui/prototypes-shadcn/button`
- `@proto.ui/prototypes-shadcn/select`

复合 anatomy 的 Root、Trigger、Content、Item 等 part 共同属于一个 family subpath，不继续拆成 part 级 public export。根入口继续保留，以兼容已有直接 npm 消费者。

## 3）依赖边界

- Base component family 不应依赖其他 Base component family。
- Base family 可以显式依赖 `transition`、`tools`、`behaviors` 等跨 family 共享能力；这些依赖不是组件 family 继承关系，也不应被隐藏在根 barrel 后面。
- Shadcn family 默认只依赖对应的 Base family。
- Shadcn family 之间默认不互相依赖；未来若需要引入，必须单独记录原因与兼容边界。
- Base 与 Shadcn 的模块加载只定义并导出 prototype/hook/family 值，不依赖 import-time 注册，因此 package 可以声明 `sideEffects: false`。

当前审计结果显示，Base 的组件间没有直接 sibling-family import；Select、Dropdown、Hover Card、Dialog 对 Transition、open-state tool 或 typeahead behavior 的复用属于上述允许的共享能力。Shadcn 当前也没有内部 family 依赖，但此前所有 Base 继承都经过根入口，本轮将其改为对应 family subpath。

## 4）CLI 与未来本地写入

`0.2` CLI 仍通过 package manager 安装完整 prototype package，但生成的 facade 必须从 family subpath 导入。CLI registry 因此需要分别记录：

- 用于安装和版本治理的根 package；
- 用于生成消费代码的 family import path。

未来 CLI 若改为把原型源码写入调用者本地，可以继续复用这份 family 与依赖元数据来计算复制闭包，不需要把当前根 package import 固化为长期架构。

## 5）验证方式

本轮不引入固定 kB 数值预算。数值容易受 React、Vite、压缩器和 chunk 策略变化影响，不能直接表达 family 边界是否成立。

CI 应验证更稳定的语义：在隔离 release tarball 消费项目中只让 CLI 生成 Shadcn Button，执行 production build，并确认最终 Rollup module graph 只包含 Shadcn Button 与 Base Button 原型文件，不包含 Tabs、Dropdown、Select、Dialog 等无关 family。随后再扩展为当前四 family 的完整 runtime smoke。

本轮实现后的实测结果为：Button-only build 的 prototype module graph 只有 Base Button 与 Shadcn Button 两个模块，bundle 约 445.5 kB、gzip 约 126.9 kB；Button、Switch、Select、Dialog 四 family fixture 约 509.7 kB、gzip 约 141.3 kB。数值用于观察，不作为 CI 阈值。

## 6）后续边界

- Lucide 是生成型图标原型库，需要按其图标级生成与 export 结构单独处理，不在本轮 Base/Shadcn family 改造中顺带决定。
- Adapter/runtime/Module 体积优化是 v0 之后的独立架构方向。
- Compiler 路线未来可以针对已知 prototype 与 host 生成更小的执行结果，但不改变本轮 family 级 source/import 边界的价值。
