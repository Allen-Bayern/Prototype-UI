# 2026-07-05 focus entry delegation 与 tabpanel 后代优先策略

> Internal record. Not normative. 本记录整理 Tabs P 实体编目过程中暴露出的 focus entry 断口，并作为 `asFocusEntry()`、host capability 与 Tabs Content 契约修订的讨论基线。

---

## 1）背景

Base Tabs Content 需要满足 tabpanel 的焦点进入语义：

- current panel 应可被顺序导航进入。
- 如果 panel 内存在可聚焦内容，焦点应优先进入后代内容。
- 如果 panel 内没有可聚焦内容，panel 自身应作为 fallback focus target。
- inactive panel 必须隐藏，并且不应留在顺序焦点导航路径中。

早期 Tabs Content 把 tabpanel 是否自动进入 Tab 顺序标记为 deferred。人工测试与 ARIA APG 讨论后，这个断口需要收敛，否则 Tabs 的键盘体验会不完整。

---

## 2）Web 与 native 能力判断

Web 平台没有标准 API 可以直接返回某个容器内第一个符合顺序焦点导航算法的 tabbable descendant。浏览器内部有 sequential focus navigation algorithm，但没有暴露类似 `getFirstTabbableDescendant(container)` 的通用接口。

Web 可用的基础能力主要是：

- `tabindex` 与原生可聚焦元素规则。
- `HTMLElement.focus()`。
- `inert` 等 subtree participation 控制。
- `ShadowRoot.delegatesFocus`，但它只解决 shadow host 的特定委派场景，不是任意容器的通用查询能力。

因此 Proto UI core 不应内建 DOM 查询逻辑。正确边界是：

> 契约表达 focus entry policy；具体宿主通过 host capability 解析 entry target，并决定如何投射顺序焦点参与。

Web adapter 可以用 DOM/flat tree 查询实现这个 capability；原生宿主如果有更强的 focus engine，则可以直接使用宿主原生能力。

---

## 3）为什么不扩展 asFocusable

`asFocusable()` 当前语义是“当前原型实例就是 focus target”。它返回 focused、focusVisible、focusable 等 target-level focus facts，并提供 `focus` / `focusSelf` / `blur`。

Tabs Content 的需求不同：

- Content 自身是一个 focus entry region。
- 真正的 focus target 可能是内部后代元素。
- 当后代优先命中时，Content 不应伪装为自身 focused。
- 该能力不应让 Content 成为 roving focus item。

因此新增 `asFocusEntry()` 比把 entry policy 塞进 `asFocusable().configure(...)` 更清晰。它表达的是“进入区域时如何委派焦点”，而不是“当前实例拥有焦点事实”。

---

## 4）拟定 API 与策略

第一阶段 API：

```ts
const entry = asFocusEntry();
entry.configure({
  strategy: 'descendant-first',
  fallback: 'self',
});
```

核心策略：

- `strategy: 'descendant-first'`：宿主优先解析容器内可参与顺序导航的后代焦点目标。
- `fallback: 'self'`：当没有合适后代目标时，容器自身可以成为顺序导航 fallback。
- `disabled` / `setDisabled(...)`：用于 current/inactive panel 这类运行时状态切换。

第一阶段不建模完整 focus trap、restore、active descendant、portal descendant 与跨 shadow root 完整 flat tree 规则。这些仍属于后续 focus scope / host capability 的深化范围。

---

## 5）Tabs Content 的落点

Base Tabs Content 应采用：

```ts
asFocusEntry().configure({
  strategy: 'descendant-first',
  fallback: 'self',
});
```

并根据 `current`/`hidden` 状态切换 entry 是否启用：

- current content：启用 focus entry。
- inactive content：禁用 focus entry。

Web adapter 的预期投射：

- current content 且存在 tabbable descendant：content host 不进入 Tab 顺序，让浏览器顺序导航自然进入 descendant。
- current content 且不存在 tabbable descendant：content host `tabIndex=0`。
- inactive content：content host `tabIndex=-1`，并由 hidden 语义移出可见与 accessibility tree。

---

## 6）后续断口

仍需保留的断口：

- Web adapter 的 descendant 查询第一阶段是 pragmatism，不等同于浏览器内部完整 sequential focus navigation algorithm。
- Shadow DOM、slot、portal、disabled fieldset、CSS visibility/layout 以及 inert ancestor 的完整处理需要继续强化。
- Native adapter 可以用自身平台能力实现同一 host capability，不需要复制 Web 的 DOM 查询策略。
- `asFocusScope()` 的 `entry` 策略未来可以与 `asFocusEntry()` 对齐，但本轮只处理 region-level entry。
