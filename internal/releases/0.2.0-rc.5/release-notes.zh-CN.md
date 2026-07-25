# Proto UI 0.2.0-rc.5

> 已准备并等待评审的 release candidate 草稿。本 release train 已将全部公开 package 与经评审的发行物料对齐到 `0.2.0-rc.5`，但尚未发布；在 rc.5 的不可变证据存在前，当前安装与试用仍应固定到已发布的 `0.2.0-rc.4`。

## 已修正

### Dialog 与 component preset 初始化

- 生成的 Web Component preset 现在会先建立所属 Root runtime/context，再连接已经解析出的默认 part。
- 添加 `shadcn-dialog` 后，默认 CloseIcon 不再先于 Dialog context 连接并抛出 `CONTEXT_PROVIDER_MISSING`。
- 默认 part 仍然只挂载一次；本修复不采用首次失败后重挂载的恢复方式。

### Switch checked 状态位移

- Shadcn Switch Root 现在保持对称 track padding，不再通过切换 Root padding 间接表达 checked 位置。
- Switch Thumb 现在从 inherited checked state 在 `translate-x-0` 与 `translate-x-5` 间切换，preset 与显式 Root/Thumb 组合均生效。
- 生成的 style CSS 现在支持 spacing-based translate utility；packed React、Vue 与 Web Component consumer smoke 覆盖 Switch 和 Dialog preset 路径。

## 仍在验证

- `0.2.0-rc.4` 发布后试用继续发现的安装、运行时、CSS、a11y、bundle、组合与 API 问题。
- npm 发布、`v0.2.0-rc.5` tag、GitHub prerelease 与不可变 spec snapshot 仍待本 draft release train 评审并合入后执行。
