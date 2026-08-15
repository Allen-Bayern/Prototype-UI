---
title: 'Adapter 贡献指南暂缓发布'
description: '为什么当前不从尚未完成的 catalog 和实现推导通用 Adapter 作者流程。'
---

Proto UI 当前不发布通用 Adapter 贡献指南。

Module、Host Capability 和官方 Adapter profile 的实体编目仍在推进，相关架构责任、缺失策略、生命周期资源所有权和 executable conformance 还没有全部收口。现有 React、Vue 和 Web Component 实现是重要证据，但其中仍可能存在尚未处理的 drift，不能仅靠模仿当前代码推导稳定作者 API。

在这条 catalog chain 完成前，本页不会：

- 把当前 Web Adapter 结构描述成跨宿主稳定架构；
- 给出新增 Adapter 的逐步实现教程；
- 从 package dependency 推断完整 Module support；
- 把未编目的 fallback 或 host wiring 描述成正式保证；
- 鼓励贡献者通过 Prototype 私有逻辑修补 Adapter parity 问题。

## 现在仍可以参与什么？

边界明确的 Adapter parity bug 仍可能开放给有经验的贡献者。对应 Issue 必须说明：

- 适用的 `C-*`、`M-*`、`HC-*`、`A-*` 与 `T-*` 实体；
- 问题属于哪个 owner layer；
- 预期行为和不能改变的协议边界；
- focused conformance test；
- Web Component、React、Vue 中需要保持或对齐的证据；
- implementation 是否已经被 maintainer 明确授权。

新的 Adapter proposal 当前只用于 maintainer-guided research。它可以收集 host capability inventory、缺失策略和最小 feasibility evidence，但不自动授权实现 PR。

## 何时发布完整指南？

至少需要：

- 相关 Module 的 facade、port 和 Host Capability owner 已编目；
- official Adapter 的 `supports`、`omits` 与 `provides` 关系有 reviewed evidence；
- lifecycle、attach/rebind/reset/disposal 责任可执行验证；
- 主要实现与实体 drift 已解决或显式记录；
- 一个完整纵向切片可以作为可信 exemplar。

在此之前，请从[贡献指南](/zh-cn/build/contribute/)选择 Prototype、文档、Demo 或已明确边界的 bug 路径。
