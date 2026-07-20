# Proto UI 0.2.0-rc.0

`0.2.0-rc.0` 是 Proto UI 第一个按照全局精确版本治理的候选版本。全部公开 `@proto.ui/*` package、内部 package 依赖边、Git tag 与 spec snapshot 共享同一个精确版本。

这是用于外部试用的预发布版本，不是 npm `latest` 对应的稳定上手路径。

## 建议验证的内容

- CLI 能否在已有项目中完成初始化，并按 family 逐个添加 component facade。
- React、Vue 与 Web Component Adapter 能否消费同一套 Prototype protocol。
- Base 与 Shadcn prototype family 能否保持独立按需引入；添加一个 family 时，不应把无关 prototype family 带入 consumer bundle。
- CLI 会把 Adapter 与 Prototype package 固定到自身的精确版本，避免混用不同 release train。
- 当前 Prototype 编目已将公开 `.proto.ts` 声明连接到 P 与 T 实体，包括可独立使用的 Transition 及其 reduced-motion fallback。

## 试用精确 RC

等待此版本发布到 npm 后执行：

```bash
npx @proto.ui/cli@0.2.0-rc.0 init
npx @proto.ui/cli@0.2.0-rc.0 add react shadcn-button
```

完整流程见 [0.2 RC 试用](https://www.proto-ui.com/zh-cn/start-here/rc-trial/)。官网主 Quick Start 会继续跟随 npm 稳定的 `latest` channel。

## 当前边界

- API 与生成结构在 `0.2.0` stable 前仍可能调整。
- CLI 当前会安装官方 Prototype package 并生成本地 component facade；暂时还不会把 styled prototype 源码复制到 consumer 项目中供直接修改。
- Shadcn 兼容是明确目标，但尚不完整。Proto UI 有意不提供 Radix 风格的 `asChild`；已知兼容差异仍属于本轮预发布的反馈目标。
- 文档、外部项目证据与 bundle 组成分析仍不完整。本 RC 暂时接受 Adapter 体积作为架构成本，同时要求 Prototype family 保持按需引入边界。

请通过 [GitHub Issues](https://github.com/Proto-UI/Proto-UI/issues) 反馈安装、类型、运行时、SSR、CSS、a11y、bundle 或 API escape 问题。

## 发布证据

GitHub Release 会附带已评审的 package BOM 与确定性 spec snapshot。在 npm 发布、`v0.2.0-rc.0` tag 与 snapshot digest 均完成核验并通过后续证据变更回填前，对应 V 实体仍保持 `draft`。
