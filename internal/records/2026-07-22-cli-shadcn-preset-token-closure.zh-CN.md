# 2026-07-22 CLI Shadcn preset token closure 修复记录

> Internal record. Not normative. 本文记录 `0.2.0-rc.1` 仓库外 React + Vite 人工试用中发现的 Dialog 动画缺失、根因与当前修复选择。稳定规则见 `D-CLI-SHADCN-PRESET-CLOSURE-0001` 与 `T-CLI-SHADCN-PRESET-CLOSURE-0001`。

## 1）外部观察

Labs 的 `0.2.0-rc.1` React consumer 中，Shadcn Dialog 打开时立即出现；关闭时保持静止约 200ms 后才被移除。官网 demo 无法复现。

Dialog Content 与 Mask 的 prototype、transition runtime 和最终 `data-pui-style` token 均正常：Content 配置 200ms enter/leave 并投射 fade/zoom，Mask 配置 150ms enter/leave 并投射 fade。外部项目由 `init` 生成的 `proto-ui-tokens.generated.css` 包含 duration，却缺少 `animate-in`、`animate-out`、fade/zoom utilities 和 `pui-enter` / `pui-exit` keyframes。因此 transition lifecycle 仍按时保留离场 view，但浏览器没有任何 CSS animation 可执行。

## 2）根因

CLI 存在两条 token CSS 输入路径：

- `proto-ui tokens --input ...` 使用 AST scanner 收集 prototype 实际 token；官网使用这条路径，因此动画正常。
- `proto-ui init` 使用 `SHADCN_STYLE_TOKENS` 静态 preset；该清单此前由人工独立维护。

Dialog motion 加入 prototype 与 CSS renderer 时，scanner 路径和官网产物随之更新，但静态 preset 没有同步。进一步将已发布 rc.1 Shadcn prototype 扫描结果与 rc.1 init 产物比较后，发现漂移并不只包含 Dialog motion，还包含部分 pressed、Select layout、duration 与其他新增 token；单独补若干 animation token 无法消除同类风险。

## 3）当前选择

`init` 必须在目标项目尚未安装 prototype package 时也能生成首份 CSS，因此不改为运行时读取目标 `node_modules`。CLI 仍携带静态 preset，但该 manifest 改由仓库中的官方 Shadcn prototype 源码通过同一 scanner 确定性生成：

```text
packages/prototypes/shadcn/src
  -> collectProtoStyleTokens()
  -> packages/cli/src/generated/shadcn-style-tokens.ts
  -> proto-ui init
  -> proto-ui-tokens.generated.css
```

仓库提供 write 与 check 命令；完整测试要求 init CSS 与 source-scan CSS 字节一致，并显式断言 Dialog animation utilities 与 keyframes。packed CLI consumer smoke 再次检查 tarball 安装后的真实 init 产物，覆盖“源码测试正确、发布包遗漏 generated manifest”的风险。

## 4）边界

- 本次不改变 Dialog transition phase、duration、presence 或 adapter 行为。
- 本次不把目标项目的 `node_modules` 变成首次 init 的前置条件。
- 本次不把 legacy scanner 宣称为最终 Style Compiler；长期可复用 compiler 方向仍见 `2026-07-20-local-styled-prototype-and-style-compiler-direction.zh-CN.md`。
- 生成 manifest 是 CLI 当前 preset 的构建输入，不是新的 authoring 真相源；官方 prototype 源码及其 spec entity 仍拥有视觉 intent。
