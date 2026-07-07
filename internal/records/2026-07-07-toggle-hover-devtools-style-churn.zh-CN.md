# Toggle hover 调试记录：DevTools 放大 runtime style churn

## 背景

在 `demo-matrix` 页面快速移入移出 `shadcn-toggle` 时，曾观察到 hover 视觉状态退出存在明显阻塞感。现象最初也能在 `shadcn-button` 上看到，但 `toggle` 更明显。

本次排查对应 GitHub Issue：<https://github.com/Proto-UI/Proto-UI/issues/288>。

## 观察

`shadcn-toggle` 的 hover 样式规则依赖两个 state 条件：

```ts
hovered === true && active === false;
```

当前 `rule-expose-state-web` 能将一部分简单 bool state 优化为 web selector，例如：

```txt
data-[active]:bg-muted
data-[focus-visible]:border-ring
data-[disabled]:opacity-50
```

但尚不能将 `hovered && !active` 这类复合条件优化成 native hover + negative state selector。因此该 hover rule 会回落到 runtime rule style 路径。

## 临时 profiling 结论

本次曾临时加入只在 URL flag / window flag 下开启的 profiling counter，用于测量：

- `event.router.pointer.enter/leave`
- `rule.evaluateAndApply`
- `feedback.flushIfPossible`
- adapter effects port 的 `queueStyle` / `requestFlush`
- `mergeTwTokensV0`
- Vue/React host token setter 与 `data-pui-style` serialize
- RAF paint sample 与 computed background

结果显示，在关闭 Chrome DevTools 后，Vue adapter 的一次 toggle hover enter/leave 中：

- `rule.evaluateAndApply` 约为亚毫秒级。
- `feedback.flushIfPossible` 约为亚毫秒级。
- `mergeTwTokensV0`、host token setter、serialize 基本为 `0ms` 量级。
- RAF sample 显示下一帧已进入正确 `backgroundColor`，且去除 transition 后 `transitionDuration: 0s`。

因此，原先观察到的“几百毫秒阻塞”并不是 runtime rule / style merge 的真实 CPU 成本。

## DevTools 放大因素

阻塞感主要出现在 Chrome DevTools 开启，尤其是 Elements 面板处于活动状态时。该面板会实时观察 DOM mutation 并渲染长 `data-pui-style` attribute。由于 fallback rule style 会导致 host 上 `data-pui-style` 在 hover enter/leave 时变化，DevTools 会显著放大调试环境下的主线程负担。

结论：

- 该现象不应被直接定性为生产环境严重交互性能缺陷。
- 但 fallback rule style 确实产生了额外 attribute churn，仍然值得优化。

## 已决定的处理

临时 profiling 代码不保留，不进入契约，也不作为通用调试能力发布。

`shadcn-toggle` 的 `transition-all` 改动回退。去除 transition 能帮助排查视觉层因素，但不是当前要提交的行为变更。

保留的工程优化方向：

1. 减少 runtime rule style replacement 的双 flush。
2. 后续扩展 `rule-expose-state-web`，让 `hovered && !active` 这类条件可优化为 native selector，避免进入 runtime style fallback。

## 本轮修复范围

本轮先优化 rule runtime style replacement：旧 rule style contribution 与新 rule style contribution 在 feedback recorder 内合并替换，最后只 flush 一次，避免 `unuse -> flush -> use -> flush`。

该优化不改变公开 `def.feedback` / `run.feedback` API，只扩展内部 `FeedbackPort` 给 rule driver 使用。

## 后续检查：hover rule 未静态化原因

`shadcn-button` 的 hover rule 形态类似：

```ts
hovered === true && variant === 'default';
```

当前 `rule-expose-state-web` 只收集依赖 state/meta 的 rule。只要 rule 依赖 `prop('variant')`，`isStateMetaDeps()` 就会拒绝该 rule，因此 Button 的 hover variant rule 不会被转换为静态 selector token。

`shadcn-toggle` 的 hover rule 形态类似：

```ts
hovered === true && active === false;
```

当前 `buildVariant()` 只支持 bool state 的 true 条件。`active === false` 这类 negative bool 条件尚无已契约化 selector 表达，因此 Toggle hover rule 也不会被转换为静态 selector token。

本轮没有扩展 selector 编译能力，因为这需要先定义 prop equality 与 negative bool 在 Web token 层的稳定表达。

另一个顺手清理是：`base-button` / `asButton` 已不再通过 deprecated `def.state.fromInteraction()` 创建 `disabled`、`hovered`、`pressed`，而是和 Toggle 一样由协议自身持有 `def.state.bool(...)` truth source，再通过 asHook state handles 提供给 styled prototype。
