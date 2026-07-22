# Proto UI 0.2.0-rc.3

> 未发布草稿。该候选版本记录 `0.2.0-rc.1` 仓库外人工试用后形成的组合能力改进；完整 release train 尚未开启，当前安装与试用仍应固定到已发布的 `0.2.0-rc.1`。

## 已改进

### 连续嵌套 trigger 形成单一宿主交互面

- 连续嵌套的 trigger prototype 现在共享一个物理 focus 与 a11y surface：最外层 trigger 保持 behavior route owner，最内层实际宿主元素承载焦点、trigger role、disabled 与 accessible projection。
- Dialog Close / Trigger 内嵌 Button 时不再产生多个 `role=button` 或竞争的 focus-visible surface；pointer、keyboard、focus 与 disabled 状态沿同一 trigger group 合并。
- React、Vue 与 Web Component adapter 共用 instance-tree trigger surface 协调，并覆盖挂载、动态投射与释放过程。

### Expose method 可从宿主 ref 直接调用

- React forwarded ref、Vue component ref 与 Web Component `getExposes()` 返回的 expose method 现在会自动进入对应 prototype 的 callback scope。
- App Maker 可以直接调用 `dialogRef.current?.getExposes().close('save')`，无需理解或手工调用 adapter 内部的 scope helper。
- 这使校验、持久化成功后再关闭 Dialog 等应用语义保持在普通 Button 中，而不必把 Save 强制建模为 Dialog Close。

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
- 完整 `0.2.0-rc.3` release train 的版本实体、package 版本、BOM、spec snapshot 与发布门禁将在统一收集问题后单独准备。
