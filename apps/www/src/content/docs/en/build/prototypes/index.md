---
title: 'Prototype Contribution Paths'
description: 'Choose a spec-first workflow for maintaining, projecting, or implementing Proto UI Prototypes.'
---

These guides are for contributors preparing to maintain, extend, or review Proto UI Prototypes. They start from the cataloged `P-*` and `T-*` graph rather than treating “write a new Prototype” as the default contribution.

## Choose a contribution path

### Maintain an existing Prototype

Start from applicable P/T entities, implementation, and public projections. This path covers behavior fixes, regression coverage, docs, demos, and drift reconciliation.

[Read Maintaining an Existing Prototype](/en/build/prototypes/maintaining-an-existing-prototype/)

### Project Base into a design language

Base already owns the protocol. The derived P adds design-language props, tokens, rules, visual anatomy, and an explicit compatibility boundary. This is the clearest current complete path for Prototype authors.

[Read Projecting Base into a Design Language](/en/build/prototypes/projecting-base-into-a-design-language/)

### Implement an approved Base semantic slice

This is advanced work. Implementation begins only after a maintainer checkpoint approves the independent subject, information paths, negative boundary, public API, P/T graph, and evidence scope.

[Read Implementing an Approved Base Semantic Slice](/en/build/prototypes/implementing-an-approved-base-slice/)

Every new public Prototype must appear on a reachable website page in the same pull request. The demo should consume the real public package export and prefer the Prototype's own anatomy and triggers. Use minimal, explicitly disclosed external orchestration only when there is no natural trigger or public controls must be demonstrated. See the [Prototype Author Checklist](/en/build/prototypes/checklist/) for delivery checks.

## Before proposing a new Base subject

Proto UI does not admit a Base Prototype because a component name is familiar or a styled library wants an inheritance point. A Base subject must own an independent, cross-host, testable input-fact-to-observable-output path with substantive executable evidence.

The longer conceptual authoring series is currently maintained primarily in Chinese. Its English routes remain available through the documentation locale fallback while translation is in progress.

## Current boundary

These guides do not infer a general Adapter contribution workflow from the incomplete Module, Host Capability, and Adapter-profile catalog. See [Adapter Contribution Guide Deferred](/en/build/adapter-guide/) for that boundary.

Use the [Prototype Author Checklist](/en/build/prototypes/checklist/) before opening a pull request.
