# 2026-07-22 Web box-model 基线与 Shadcn Switch spacing 收敛

> Internal record. Not normative. 本文记录 `0.2.0-rc.1` 仓库外人工试用发现的 box-model 失配、方案比较和当前修正边界。稳定选择以 `D-WEB-STYLE-BASELINE-0001`、适用的 P/C/T 实体及其后续 revision 为准。

## 1）外部观察

独立 React + TypeScript + Vite consumer 没有安装 Tailwind Preflight，也没有为所有元素声明 `box-sizing: border-box`。Proto UI Shadcn Switch Root 同时使用固定 width/height、border 与 inline padding，Thumb 同时使用固定 size 与 border；浏览器默认 `content-box` 会把 padding 和 border 加到声明尺寸之外，导致 Switch 尺寸与布局明显膨胀。

该问题不是 React Adapter 的宿主差异，也不是 Switch value/state 行为错误。当前物理 token CSS 正确生成了各个 width、height、padding 与 border declaration，但遗漏了这些 Tailwind/Shadcn 风格尺寸组合隐含依赖的 box-model 基线。

试用同时发现 Switch 用 `pl-[20px]`、`pr-[20px]` 表达位移 padding，而当前 spacing scale 已有等价的 token `5`。继续保留 arbitrary value 会让官方 prototype 无谓耦合具体 CSS literal，也弱化 token scale 的可治理性。

## 2）采用方案

生成的 Web token CSS 对以下有限 selector 输出 `box-sizing: border-box`：

```css
[data-pui-style],
[data-pui-style]::before,
[data-pui-style]::after {
  box-sizing: border-box;
}
```

该规则属于 Style Compiler/物理 token CSS 输出，不属于 Shadcn theme variables。它不会写入 document-wide `*` reset，也不会递归修改未带 `data-pui-style` 的普通宿主元素或用户 children。尺寸敏感 prototype 不需要各自重复添加 `box-border` token。

Switch Root 的 unchecked/checked inline padding 分别改用 `pr-5` 与 `pl-5`；当前 0.5 对侧 padding 保持不变。标准 scale 能精确表达时，官方 prototype 应优先使用 canonical token；arbitrary value 仍可用于 scale 无法表达的值。

## 3）验证边界

- token CSS renderer 输出 scoped element 与 pseudo-element baseline。
- 生成 CSS 不含 document-wide box-model reset。
- CLI `init` 的 token CSS 包含该 baseline，theme CSS 不承担 reset。
- Shadcn Switch runtime style plan 使用 `pl-5`，不再使用 `pl-[20px]`。
- 默认 Shadcn token preset 同步包含 `pl-5`、`pr-5` 和 lowered checked selector。

真实浏览器中的 Switch 外部几何仍应在后续 consumer/browser evidence 中持续观察；当前自动检查首先稳定生成边界与 prototype token surface。

## 4）版本边界

该修正进入未发布的 `0.2.0-rc.2` 草稿，不回写已发布的 rc.1。完整 rc.2 release train 仍在统一收集人工试用问题后单独准备。
