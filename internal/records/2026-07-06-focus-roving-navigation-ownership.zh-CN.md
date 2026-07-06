# Focus Roving 导航所有权收口

日期：2026-07-06

## 背景

Tabs 第一轮实现中，`base-tabs-list` 声明了 `asFocusRoving()`，但实际方向键导航仍由 `base-tabs-trigger` 监听全局 `key.down` 后调用 list 暴露的 `focusNext` / `focusPrev` / `focusFirst` / `focusLast` 方法完成。这让 Trigger 同时承担了 trigger activation 与 collection navigation 两类职责，也让 default action control 容易在不同原型中重复实现。

同时，Focus Roving 的契约已经要求 Tab 顺序导航与 roving movement 分离：非当前 item 可以退出自然 Tab 顺序，但仍必须能被 roving request 程序化聚焦。现有 `FocusCenter.getRovingMembers` 把 `navParticipation: 'none'` 的 focusable 排除出 roving candidates，与该目标不一致。

## 决策

1. Focus Roving 拥有同一 roving set 内的键盘导航解释。
   - Arrow keys、Home、End 的 roving movement 由 focus module / `asFocusRoving()` 处理。
   - 对应的 default-action control 也由 focus roving 内部请求。
   - 具体 trigger/item 原型不应重复实现 sibling-local roving navigation。

2. Trigger 拥有 activation / selection 请求，不拥有 sibling navigation。
   - `base-tabs-trigger` 仍负责 focusable、selected、disabled、activation request、automatic activation on focus。
   - `base-tabs-trigger` 不再读取 list exposes 后手动转发方向键导航。

3. `navParticipation` 只控制自然 Tab 顺序参与，不控制 roving candidate 资格。
   - `navParticipation: 'none'` 的 focusable 可以从自然 Tab 顺序退出。
   - 只要它仍是 enabled focusable 且属于 roving provider，它仍可被 `focusNext` / `focusPrev` / arrow key roving request 聚焦。

4. Focus Roving 需要运行期同步部分导航策略。
   - setup 期 `configure(...)` 仍负责声明 roving owner 与初始策略。
   - 对 Tabs 这类 orientation 来自 context 的组件，focus roving handle 提供窄口 `setOrientation(...)` / `setLoop(...)` 同步运行期策略。

## 实现范围

- `FocusCenter.getRovingMembers` 不再因为 `navParticipation: 'none'` 排除候选。
- `FocusRovingHandle` 增加 `setOrientation(...)` 与 `setLoop(...)`。
- `base-tabs-list` 打开 `asFocusRoving({ navigation: 'arrow' })`，并从 Tabs context / props 同步 orientation 与 loop。
- `base-tabs-trigger` 删除方向键、Home、End 的全局 keydown 转发逻辑。

Select / Dropdown 仍保留旧的 `useFocusRoving` + item 转发逻辑，后续在对应 P 实体收口时迁移。
