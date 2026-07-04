# 2026-07-04 asHook state handle 命名与投影断口

> Internal record. Not normative. 本记录描述 Switch / shadcn-switch 校准过程中暴露出的 asHook state handle 投影问题，并为后续契约与 API 修正提供讨论基线。

---

## 1）背景

在校准 `base-switch`、`base-switch-thumb` 与 `shadcn-switch` 时，我们遇到一个组合层问题：

- `asSwitchRoot()` 理论上应让下游 styled prototype 取得 Switch root 引入的全部 state handles。
- 但当前 `stateHandles` 的可用性强烈依赖 state handle 是否有可识别名称。
- 现有实现中 named state handles 的收集逻辑会优先使用 `expose.state` 的 key。
- 这导致 Prototype Maker 容易把 App Maker expose surface 与 Prototype Maker composition surface 混在一起理解。

实际表现是：styled prototype 如果重新调用 `def.state.fromInteraction('focusVisible')`，可能得到与 `asSwitchRoot()` 内部不同的 handle，从而导致 rule 绑定、web style projection 或 state 同步出现偏差。

---

## 2）当前判断

asHook 的契约意图应是：

> asHook result 应让调用者取得 asHook setup 引入的全部 state handles，并把它们投影为 borrowed views。

这里的“全部 state handles”不应只等同于 exposed states。

需要区分两个命名层：

1. **state name / composition name**
   - 用于 Prototype Maker 通过 asHook result 识别、借用和组合 state handle。
   - 属于 prototype composition surface。
   - 应由 state declaration 自身提供，而不是由 expose declaration 反推。

2. **expose name**
   - 用于 App Maker 通过 component expose surface 访问 external state。
   - 属于 app-facing surface。
   - 可以与 state name 相同，但不是同一个概念。

因此：

```ts
const focusVisible = def.state.fromInteraction('focusVisible');
def.expose.state('focusVisible', focusVisible);
```

这里第一个 `focusVisible` 应被理解为 state declaration 的稳定 state name；第二个 `focusVisible` 是 expose surface name。二者可以相同，但契约上应分离。

---

## 3）为什么不先新增一级 API

一种方案是新增类似 `def.contract.state(...)`、`def.compose.state(...)` 或 `def.artifact.state(...)` 的一级 API，用来显式声明 asHook 可组合状态。

当前讨论认为这偏重：

- 它增加新的 authoring surface。
- 它容易让 prototype 作者在 state declaration、expose declaration 与 composition declaration 三处重复登记。
- 对现有代码迁移成本更高。

更轻的方向是：

> 要求所有 state 在定义时必须具备稳定 name，并让 asHook named state handles 直接使用 state declaration name。

这样 API 变化更接近现有 `def.state.bool('open', false)`、`def.state.fromInteraction('focusVisible')`、`def.state.fromAccessibility('checked')` 形态。

---

## 4）待讨论 API 形态

仍需决定 state name 以什么形式进入 API。

候选方向：

### 4.1 复用现有 semantic/name 参数

```ts
def.state.bool('open', false);
def.state.fromInteraction('focusVisible');
def.state.fromAccessibility('checked');
```

优点：

- API 变化最小。
- 与当前代码直觉一致。
- 迁移主要是明确契约和补齐无名路径。

风险：

- 现有参数同时承担 semantic、state name、web projection 语义，可能需要文档清晰分层。

### 4.2 引入 options.name

```ts
def.state.bool('@internal/open', false, { name: 'open' });
def.state.fromInteraction('focusVisible', { name: 'focusVisible' });
```

优点：

- 可以分离 internal semantic 与 composition name。
- 适合复杂组件中存在多个同类 state 的场景。

风险：

- API 更重。
- 会产生“semantic 和 name 不一致时谁用于 web projection / rule identity”的新规则。

### 4.3 短期混合策略

短期可以先规定：

- 现有 state declaration 的第一个字符串参数是默认 state name。
- 后续如果需要分离 semantic 与 composition name，再增加 options。
- expose name 永远不作为唯一 state handle identity 来源。

---

## 5）契约修正方向

`C-AS-HOOK-0007` 应补充表达：

- asHook state projection 覆盖 asHook setup 引入的全部 state handles，而不只覆盖 exposed states。
- asHook result 中 named `stateHandles` 的命名来源应来自 state declaration identity / state name。
- `def.expose.state(exposeName, stateHandle)` 不应把 `exposeName` 解释为 state handle 的唯一组合名称。
- 如果多个 state declaration 产生同名 state handle，应由 state/asHook 契约定义冲突诊断，不应静默覆盖。

当前实现仍存在断口：

- `collectNamedStateHandles` 会用 expose key 覆盖 state semantic。
- `AS-HOOK-0455` 测试目前断言 expose key names projected state handle。
- 这与本记录建议的长期方向相反，应在后续修正中调整。

---

## 6）下一步

建议按以下顺序推进：

1. 在 `C-AS-HOOK-0007` 中补充“全部 state handles borrowed projection”的 active criterion。
2. 将 state name API 形态保留为 open question。
3. 后续决定 state name API 后，再更新 core/runtime 实现与 `AS-HOOK-0455` 测试。
4. 最后回头修正 `shadcn-switch-root`，避免依赖重新创建同名 state handle 或只借用部分 state handle。
