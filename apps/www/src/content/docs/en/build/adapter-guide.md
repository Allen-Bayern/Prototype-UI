---
title: 'Adapter Contribution Guide Deferred'
description: 'Why Proto UI does not infer a general Adapter authoring workflow from an incomplete catalog and current implementation.'
---

Proto UI does not currently publish a general Adapter contribution guide.

Module, Host Capability, and official Adapter-profile cataloging is still in progress. Architecture ownership, omission strategy, lifecycle resource ownership, and executable conformance have not all converged. The React, Vue, and Web Component implementations are important evidence, but they may still contain unresolved drift and cannot by themselves define a stable authoring API.

Until that catalog chain is complete, this page will not:

- present the current Web Adapter structure as stable cross-host architecture;
- provide a step-by-step new-Adapter tutorial;
- infer complete Module support from package dependencies;
- describe uncataloged fallback or host wiring as a formal guarantee; or
- encourage Prototype-specific patches for Adapter parity problems.

## What can contributors do now?

Experienced contributors may work on a bounded Adapter parity bug when its issue states:

- applicable `C-*`, `M-*`, `HC-*`, `A-*`, and `T-*` entities;
- the owning layer;
- expected behavior and protocol boundaries that must remain unchanged;
- focused conformance tests;
- evidence to preserve or align across Web Component, React, and Vue; and
- explicit authorization to implement.

New Adapter proposals are maintainer-guided research. They may collect a host-capability inventory, omission strategy, and minimal feasibility evidence, but they do not automatically authorize an implementation pull request.

## When can a complete guide be published?

At minimum:

- relevant Module facade, port, and Host Capability ownership is cataloged;
- official Adapter `supports`, `omits`, and `provides` relations have reviewed evidence;
- lifecycle attach, rebind, reset, and disposal responsibilities are executable;
- major drift between entities and implementation is resolved or recorded; and
- one complete vertical slice can serve as a trustworthy exemplar.

Until then, use the [contribution guide](/en/build/contribute/) to choose a Prototype, docs, demo, or bounded bug path.
