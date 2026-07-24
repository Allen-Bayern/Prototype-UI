# Proto UI 0.2.0-rc.4

> 已准备并等待评审的 release candidate 草稿。本 release train 已将全部公开 package 与经评审的发行物料对齐到 `0.2.0-rc.4`，但尚未发布；在 rc.4 的不可变证据存在前，当前安装与试用仍应固定到已发布的 `0.2.0-rc.3`。

## 已修正

### Web Component Tabs Content 重物化

- Web Component Tabs Content 现在可以在已经访问过的 panel 经历默认 `current -> inactive -> current` L1 生命周期后重新正常显示。
- 受影响的 Proto instance 与 `current` state 原本已被正确保留；panel 消失是因为新 view epoch 揭示时，持久 custom-element owner 上仍残留旧的原生 `hidden` 属性。
- Web Component a11y projection 现在可以在重物化宿主仍受 reveal barrier 保护时投射最新 semantic snapshot；focus projection 仍需等待宿主真正可交互。
- 通用 L1 a11y replay 测试与 Shadcn Tabs `A -> B -> A` Web Component 集成测试分别保护生命周期边界和本次人工试用路径。

## 仍在验证

- `0.2.0-rc.3` 发布后试用继续发现的安装、运行时、CSS、a11y、bundle、组合与 API 问题。
- npm 发布、`v0.2.0-rc.4` tag、GitHub prerelease 与不可变 spec snapshot 仍待本 draft release train 评审并合入后执行。
