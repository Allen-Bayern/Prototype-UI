# Proto UI 0.2.0-rc.1

> 已于 2026 年 7 月 21 日通过 npm `next` channel 发布。全部 37 个公开 package、`v0.2.0-rc.1` tag、GitHub prerelease 与不可变 spec snapshot 共享这一精确发行身份。

## 已修正

### Adapter 公共类型保真

- React 与 Vue Adapter 生成宿主组件时会保留完整 Prototype identity，使 CLI facade 获得精确 props 与 outward-event listener 类型，不再退化为 `any`。
- React ref、Vue exposed instance 与 Web Component element 现在会投影带类型的 expose value、method 与只读 external state handle。
- Web Component constructor 会携带来源 Prototype 类型，并导出可供宿主工具复用的 props 投影 utility。
- 打包消费发布检查现在会对 React、Vue 与 Web Component facade 同时验证合法用法、非法 variant 与 unknown prop 拒绝。
- Adapter 只声明当前运行时确实支持的 host props；本次修正不会假装完整 native-element prop forwarding 已经存在。

### Web 主题默认解析

- CLI 生成的 Shadcn theme 在应用没有显式主题时，会通过 `prefers-color-scheme` 跟随系统 light/dark 偏好。
- 根元素的 `data-theme="light"` / `data-theme="dark"` 或 `.light` / `.dark` 仍具有更高优先级，可由应用显式覆盖系统偏好。
- Style Compiler 生成的 `dark:*` token CSS 使用同样的系统 fallback，避免 theme variables 与组件暗色增量处于不同主题。
- React、Vue 与 Web Component Adapter 共享同一个默认 Web color-scheme resolver，使 Prototype environment meta 与生成 CSS 使用一致的初始有效主题。
- RC Trial 文档补充了默认跟随系统与显式主题覆盖方式。

## 仍在验证

- 主题运行期切换的 meta 订阅与 rule 重算边界。
- 嵌套组件子树中的局部 light/dark scope。
- `0.2.0-rc.1` 发布后试用继续发现的安装、类型、运行时、CSS、a11y、bundle 与 API 问题将进入后续 release train。
