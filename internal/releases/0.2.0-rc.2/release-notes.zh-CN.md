# Proto UI 0.2.0-rc.2

> 未发布草稿。该候选版本继续收集 `0.2.0-rc.1` 仓库外人工试用发现；完整 release train 尚未开启，当前安装与试用仍应固定到已发布的 `0.2.0-rc.1`。

## 已修正

### 移除 props 后恢复默认值

- Props resolution 现在会把 `missing` 解释为宿主撤回该输入：从合法 provided value 变为 omitted key 时，不再通过 `prevValid` 保留已撤回的值，而是重新采用 `setDefaults`、声明 `default` 或 canonical `null`。
- `prevValid` 仍用于恢复“key 仍被提供、但本轮值为空或无效”的输入，避免删除语义与非法输入容错相互混淆。
- React、Vue 与 Web Component 共享这一语义；修正位于 Props Kernel，不需要 Adapter 层的宿主特例。
- React Shadcn Button 删除 `disabled` 后会恢复为 enabled，删除 `variant` 或 `size` 后会恢复对应 default tokens。
- 跨 Adapter resolved-snapshot 合约、Base Button 行为测试与 Shadcn Button visual-token 测试覆盖了 provided-to-missing 转换。

## 仍在验证

- `0.2.0-rc.1` 后续人工试用发现的安装、运行时、CSS、a11y、bundle 与 API 问题。
- 完整 `0.2.0-rc.2` release train 的版本实体、package 版本、BOM、spec snapshot 与发布门禁将在统一收集问题后单独准备。
