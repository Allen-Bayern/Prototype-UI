# Proto UI 0.2.0-rc.3

> 已于 2026 年 7 月 22 日通过 npm `next` channel 发布。全部 37 个公开 package、`v0.2.0-rc.3` tag、GitHub prerelease 与不可变 spec snapshot 共享这一精确发行身份。

## 已修正

### 移除 props 后恢复默认值

- Props resolution 现在会把 `missing` 解释为宿主撤回该输入：从合法 provided value 变为 omitted key 时，不再通过 `prevValid` 保留已撤回的值，而是重新采用 `setDefaults`、声明 `default` 或 canonical `null`。
- `prevValid` 仍用于恢复“key 仍被提供、但本轮值为空或无效”的输入，避免删除语义与非法输入容错相互混淆。
- React、Vue 与 Web Component 共享这一语义；修正位于 Props Kernel，不需要 Adapter 层的宿主特例。
- React Shadcn Button 删除 `disabled` 后会恢复为 enabled，删除 `variant` 或 `size` 后会恢复对应 default tokens。
- Lucide Icon 删除 `size`、`strokeWidth`、`stroke` 等 visual props 后会恢复 24、2、currentColor 等协议默认值。
- 跨 Adapter resolved-snapshot 合约、Base Button 行为测试与 Shadcn Button visual-token 测试覆盖了 provided-to-missing 转换。

### Scoped Web box-model 基线

- 生成的 Proto UI token CSS 现在会对带 `data-pui-style` 的元素及其 `::before` / `::after` 伪元素应用 `box-sizing: border-box`，在宿主没有 Tailwind Preflight 或全局 reset 时仍保持组件声明尺寸。
- 该基线仅作用于 Proto UI style projection，不会安装 document-wide `*` reset、改变无关宿主元素或进入 Shadcn theme variable 文件。
- Shadcn Switch track 位移改用 canonical `pl-5` / `pr-5` spacing tokens，不再使用等价的 `[20px]` arbitrary values。
- CSS renderer、CLI init 与 Shadcn Switch 测试覆盖生成基线、输出归属与 canonical spacing-token surface。

### 嵌套 trigger 路由

- React、Vue 与 Web Component adapter 现在会把连续嵌套 trigger 的 logical route owner 与物理 `EventTarget` 分开处理，不再把 opaque logical token 强制作为 event target。
- nested Button、Dialog Trigger / Close 内嵌 Button 等结构可以在最外层连续 trigger route 上完成 activation，不再抛出 `redirectRoot() requires an EventTarget-like object`。
- logical owner 使用稳定的 dynamic event target projection；即使 owner view 在 setup 后才出现，或 presence / lifecycle 产生新的 view epoch，既有 event registrations 也会绑定或迁移到当前 router target。
- Adapter owner 初始化失败现在会回滚部分 wiring/session 状态，避免 React 恢复流程继续抛出误导性的 `owner is already initialized`。
- runtime、adapter-base、真实 ReactDOM、Vue renderer 与 Web Component Dialog 测试覆盖逻辑/物理身份分离、late target、重复 view binding、click 与键盘 activation。

### 完整的 CLI Shadcn 样式预设

- `proto-ui init` 现在会生成与官方 Shadcn prototype 源码扫描结果一致的 token CSS closure，不再依赖可能发生漂移的独立人工 preset 清单。
- 外部项目会获得 Dialog 进入/离开 keyframes 以及 animate、fade、zoom utilities，在保留 Mask 150ms、Content 200ms 既有生命周期时序的同时恢复可见动画。
- preset manifest 由源码确定性生成，并由 stale check、init 与源码扫描的完整等价测试，以及打包 CLI consumer smoke 断言共同保护。

## 已改进

### 连续嵌套 trigger 形成单一宿主交互面

- 连续嵌套的 trigger prototype 现在共享一个物理 focus 与 a11y surface：最外层 trigger 保持 behavior route owner，最内层实际宿主元素承载焦点、trigger role、disabled 与 accessible projection。
- Dialog Close / Trigger 内嵌 Button 时不再产生多个 `role=button` 或竞争的 focus-visible surface；pointer、keyboard、focus 与 disabled 状态沿同一 trigger group 合并。
- React、Vue 与 Web Component adapter 共用 instance-tree trigger surface 协调，并覆盖挂载、动态投射与释放过程。

### Expose method 可从宿主 ref 直接调用

- React forwarded ref、Vue component ref 与 Web Component `getExposes()` 返回的 expose method 现在会自动进入对应 prototype 的 callback scope。
- App Maker 可以直接调用 `dialogRef.current?.getExposes().close('save')`，无需理解或手工调用 adapter 内部的 scope helper。
- 这使校验、持久化成功后再关闭 Dialog 等应用语义保持在普通 Button 中，而不必把 Save 强制建模为 Dialog Close。

### React ref 不再造成伪 props 更新循环

- React adapter 现在比较 adapter 投射后的 raw props snapshot，而不是把 React 内部 props 对象的引用变化直接解释为 runtime input 更新。
- React 19 `forwardRef` 在剥离 `ref` 时可能重新构造 props 对象；该宿主实现细节不再触发 feedback commit、`setHostTokens()` 与 adapter update 之间的无限循环。
- CLI preset 在没有 forwarded ref 时也不再向 raw facade 主动写入空 `ref` 键；真正提供 ref 时仍保持透明转发。
- 真实 ReactDOM 回归测试与隔离 tarball consumer smoke 覆盖带 ref 的 styled Dialog Content、实际 prop 更新与生成 facade。

### CLI component preset 与 Switch 默认 Thumb

- CLI registry 与 facade generator 新增 `replaceable-default-part` component preset，明确区分“未提供而采用默认部分”“提供兼容替换”“显式省略”三种状态。
- 生成的 Shadcn Switch convenience facade 会默认物化 Thumb，同时允许 React `thumb`、Vue `#thumb`、直接 Thumb 子节点或 Web Component omission attribute 覆盖该行为。
- `ShadcnSwitchRoot` / `ShadcnSwitchThumb` raw facades 继续保留，anatomy 只负责验证，不在 runtime 中秘密创建 prototype instance。

### Shadcn Dialog 组合面

- `ShadcnDialogClose` 改为无样式的 semantic close boundary；按钮外观通过显式嵌套 `ShadcnButton` 获得，并依赖连续 trigger 合并保持一个宿主交互面。
- 新增 layout-only `ShadcnDialogHeader` 与 `ShadcnDialogFooter`，Footer 不预设 Confirm、Cancel 或 Save 行为。
- 新增独立、可访问的 `ShadcnDialogCloseIcon`。生成的 `ShadcnDialogContent` convenience facade 默认物化该 X 关闭面，同时支持替换或显式省略。
- 生成器保留 `ShadcnDialogContentRaw`，使不需要默认 CloseIcon 的调用方可以完全退出 preset 行为。

## 仍在验证

- component preset 在更多 compound component 与 adapter 上的适用边界；当前只以 Switch Thumb 与 Dialog Content CloseIcon 作为验证切片。
- 连续嵌套 trigger 中更复杂的多层 focus-visible、role 转移与非 Web host projection。
- `0.2.0-rc.3` 发布后试用继续发现的安装、运行时、CSS、a11y、bundle、组合与 API 问题将进入后续 release train。
