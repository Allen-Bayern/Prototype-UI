# Proto UI 0.2.0-rc.2

> 未发布草稿。该候选版本继续收集 `0.2.0-rc.1` 仓库外人工试用发现；完整 release train 尚未开启，当前安装与试用仍应固定到已发布的 `0.2.0-rc.1`。

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

## 仍在验证

- `0.2.0-rc.1` 后续人工试用发现的安装、运行时、CSS、a11y、bundle 与 API 问题。
- 完整 `0.2.0-rc.2` release train 的版本实体、package 版本、BOM、spec snapshot 与发布门禁将在统一收集问题后单独准备。
