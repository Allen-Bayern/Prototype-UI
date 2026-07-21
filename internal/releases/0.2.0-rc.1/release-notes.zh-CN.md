# Proto UI 0.2.0-rc.1（未发布草稿）

> 本文件是在 `0.2.0-rc.0` 外部人工试用期间持续收集的候选更新日志。它不代表 `0.2.0-rc.1` release train 已创建或发布；当前 `VERSION`、公开 package manifest 与 V 实体仍保持 `0.2.0-rc.0`。正式准备发布时必须补齐 draft V 实体、全局精确版本投射、package BOM、spec snapshot 与完整 release checks。

## 已修正

### Web 主题默认解析

- CLI 生成的 Shadcn theme 在应用没有显式主题时，会通过 `prefers-color-scheme` 跟随系统 light/dark 偏好。
- 根元素的 `data-theme="light"` / `data-theme="dark"` 或 `.light` / `.dark` 仍具有更高优先级，可由应用显式覆盖系统偏好。
- Style Compiler 生成的 `dark:*` token CSS 使用同样的系统 fallback，避免 theme variables 与组件暗色增量处于不同主题。
- React、Vue 与 Web Component Adapter 共享同一个默认 Web color-scheme resolver，使 Prototype environment meta 与生成 CSS 使用一致的初始有效主题。
- RC Trial 文档补充了默认跟随系统与显式主题覆盖方式。

## 仍在验证

- 主题运行期切换的 meta 订阅与 rule 重算边界。
- 嵌套组件子树中的局部 light/dark scope。
- 后续 `0.2.0-rc.0` 外部人工试用收集到的安装、类型、运行时、CSS、a11y、bundle 与 API 问题。
