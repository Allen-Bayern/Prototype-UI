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

---

## 7）进一步决策：expose 不参与 asHook state handle 命名

进一步讨论后，当前倾向已经更明确：

> `expose.state` 不应参与 asHook state handle identity。过去依赖 expose key 为 asHook state handle 命名的实现与测试应被视为同期引入的局部补丁，可以彻底移除，不需要保留为长期兼容层。

这个判断的理由是：

- expose surface 面向 App Maker，state handle projection 面向 Prototype Maker composition。
- expose name 与 state name 可以相同，但它们不是同一层身份。
- 如果 expose key 可以覆盖 state name，下游 styled prototype 会难以判断 state handle 的真实来源。
- 对没有 expose 的内部 composition state，这种命名方式天然失效。
- 该行为是在 Button P 实体编目同期暴露出的局部修补，并非已发布长期历史包袱。

对应决策实体：

```text
D-AS-HOOK-STATE-HANDLE-NAMING-0001
```

---

## 8）asHook 嵌套返回值边界

新的方向不是“递归返回所有 state handles”，而是：

- asHook result 的自动 `stateHandles` 只包含本层 asHook setup frame 直接声明的 state handles。
- 如果本层 asHook 调用了另一个 asHook，runtime 应自动把 child asHook call 记录为 child asHook entry。
- child asHook 的返回值应保留在 child entry result 中。
- runtime 不应把嵌套 asHook 的 state handles 自动摊平进外层 result。

这让 authoring 结构更可控：

```ts
asNested();
const open = def.state.bool('open', false);
```

调用者应看到：

```ts
result.stateHandles.open;
result.asHooks[0].result.stateHandles.value;
```

而不是：

```ts
result.stateHandles.open;
result.stateHandles.value; // nested 被运行时自动摊平
```

这里需要特别区分两个返回通道：

- authored asHook 的 `setup` 结构不因为 `defineAsHook` 改变；它仍然遵守 prototype setup 契约，只能返回 render function 或 void，void 的语义是默认匿名 slot render。
- `AsHookResult` 是 asHook caller 的返回值，由 runtime 在执行 setup 后分析当前 setup frame 的语法贡献合成，包括 state handles、artifacts、可取消 setup effects 的 disposers，以及 setup 返回的 render function。

因此，嵌套 asHook result 的保留、转交、封装或重命名，不应通过放宽 authored `setup` 的返回值形态来解决，而应通过明确的 result-composition 机制解决。当前运行时对 asHook render fragment 的消费覆盖也仍然很窄；这部分在 value 类原型需要复用渲染片段时会变成更明确的后续断口。

后续实现已进一步收敛：child asHook result 的基础保留不需要 prototype author 显式声明，runtime 可以在 SPI 层自动收集当前 setup frame 直接调用过的 child asHook entries，并将其暴露为 `AsHookResult.asHooks` / `artifacts.asHooks`。

---

## 9）state name 规则

当前建议新增 state 层规则：

1. 每个 state declaration 必须提供 stable state name。
2. state name 是非空字符串。
3. 同一 setup frame 内不得声明多个同名 state。
4. 官方 JS/TS 原型应优先使用 identifier-safe state name。
5. portable authoring 的基础要求仍然只是稳定字符串；非 identifier-safe name 必须可通过 `getState(name)` 访问。

其中“同一 setup frame”是重要边界：

- 普通 prototype setup 有自己的 state name namespace。
- 每个 asHook setup frame 有自己的 state name namespace。
- 嵌套 asHook 不与外层 asHook 自动合并 state namespace。

---

## 10）API 迁移计划草案

后续实施可以分几步：

1. Contract / test：
   - 更新 `C-AS-HOOK-0007`，明确 direct setup frame state handles 与嵌套 result 边界。
   - 更新 state contract，新增 state name 必填、setup frame 内唯一性。
   - 删除或重写 `AS-HOOK-0455` 中“expose.state key names projected state handle”的断言。

2. Runtime：
   - 修改 asHook capture：区分本层 setup 直接声明的 state 与 nested asHook capture 合并效果。
   - `collectNamedStateHandles` 不再用 expose key 覆盖 state name。
   - 对同一 setup frame 内重复 state name 进行诊断或抛错。

3. Core typing：
   - 将 state definition API 的第一个参数契约化为 `name`。
   - 如果 semantic 需要与 name 分离，再通过 options 或后续参数表达。
   - 保留 `getState(name)` 访问任意字符串 name；TS property ergonomics 优先服务 identifier-safe names。

4. Prototype cleanup：
   - `base-switch` / `shadcn-switch` 回到统一从 `asSwitchRoot().stateHandles` 借用全部需要的 root states。
   - 检查 Button / Toggle / Dialog 等使用 asHook state handles 的 styled prototypes，避免重新声明同名 state handle。

---

## 11）暂不直接决定的问题

本记录仍不直接决定：

- `def.state.bool` 等 API 是“把现有第一个参数直接解释为 name”，还是“新增 name 参数并把现有 semantic 参数后延”。
- state semantic 与 state name 分离后，web projection、debug display、rule identity 的默认字段选择。
- 迁移期是否需要短暂保留 expose key fallback。
- 在 runtime 已能自动收集 child asHook entries 的前提下，是否还需要额外的 result alias / rename / filtering SPI，以及它应面向 runtime/tooling 还是未来更高层 authoring helper。

这些问题由 `D-AS-HOOK-STATE-HANDLE-NAMING-0001` 的 open questions 继续跟踪。
