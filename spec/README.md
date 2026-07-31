# Proto UI spec entity catalog

`spec/**` is the machine-governed source of truth for Proto UI. It models project semantics as versioned, related entities rather than as a collection of independent prose documents.

The catalog is intentionally incomplete. An entity being present does not mean it is stable, and an absent entity does not mean the implementation has no behavior. Always read lifecycle status, version, relations, tests, and migration context together.

## Entity types

The schema currently accepts eight entity types.

| Directory | Type | ID form | Responsibility |
| --- | --- | --- | --- |
| `contracts/` | `contract` | `C-<DOMAIN>-NNNN` | Normative, cross-cutting protocol rules and acceptance criteria. |
| `prototypes/` | `prototype` | `P-<IDENTITY>` | Stable identities and behavioral protocols for official prototypes or prototype parts. |
| `modules/` | `module` | `M-<DOMAIN>-NNNN` | Semantic module identities and the contracts they satisfy. |
| `decisions/` | `decision` | `D-<DOMAIN>-NNNN` | Stabilized design and governance choices, including rejected alternatives when relevant. |
| `host-caps/` | `host-cap` | `HC-<DOMAIN>-NNNN` | Capabilities expected from or projected to a host environment. |
| `tests/` | `test` | `T-<DOMAIN>-NNNN` | Conformance cases and mappings to executable fixtures or tests. |
| `versions/` | `version` | `V-<DOMAIN>-NNNN` | Release identity, channel, tag, package policy, and immutable publication evidence. |
| `knowledge/` | `knowledge` | `K-<DOMAIN>-NNNN` | Shared conceptual vocabulary and explanatory models used by other entities. |

Adapter and compiler are not schema entity types at present. Their implementation and legacy contract material may exist, but do not invent an entity type or encode host-specific profiles into unrelated entity types without an explicit schema and governance decision.

## Lifecycle and versions

Every entity declares `since` and one of these statuses:

- `draft`: cataloged work in progress. It is the current formal direction, not a stable public guarantee.
- `active`: an applicable current guarantee.
- `deprecated`: retained for compatibility or migration and accompanied by `deprecatedSince`.
- `removed`: historical after `removedSince`.

`replacedBy` points to a replacement of the same entity type. `revisions` records semantic changes against project versions. Relations may also have `since` and `until` bounds.

A version snapshot includes entities and relations available at that version. The current working catalog can contain draft work beyond the immutable snapshot published for a release, so distinguish these identities:

- release evidence recorded by a `V-*` entity;
- the current workspace snapshot calculated from the checked-out `spec/**` files;
- generated views such as the workspace dataset and Agent project understanding.

## Core fields

Common fields include:

- `id`, `type`, `title`, `status`, and `since` for identity and lifecycle;
- `summary` and bilingual `statement` for the rule or model;
- `criteria` for individually addressable acceptance points;
- `openQuestions` for explicit unresolved gaps;
- `sources` for traceable implementation or document references;
- `revisions` for versioned semantic changes;
- `tags` for discovery.

Prototype entities may additionally define `anatomy` and `inherits.prototypes`. Test entities may define `cases` and `implementations`. Version entities must define `release` metadata.

Do not treat `summary`, tags, or filenames as substitutes for criteria and relations. A useful entity is an identity anchor in a graph, not merely a titled placeholder.

## Relations

The schema supports these relation groups:

- `relates`: non-owning association.
- `dependsOn`: semantic dependency.
- `inherits`: prototype inheritance only.
- `references`: supporting reference without dependency ownership.
- `refines`: a more specific expression of another entity.
- `satisfies`: an identity or implementation scope claims conformance to contracts.
- `verifies`: a test verifies entity criteria or anchors.
- `explains`: knowledge or decisions explain another entity.
- `exercises`: coverage reaches a surface without necessarily verifying its full semantics.
- `requires`: a capability or semantic prerequisite.
- `owns`: explicit semantic ownership.

Relations are typed by target collection (`contracts`, `prototypes`, `modules`, `decisions`, `hostCaps`, `tests`, or `knowledge`). The loader validates that targets exist and have the declared type. Criteria-level references may use `anchors` to point to exact criterion IDs.

Prefer a precise directional relation over repeating the same fact in prose. When a relationship is time-bound, declare its version range rather than deleting historical context.

## Source-of-truth migration

The former primary contract layer lives under `internal/contracts/**`. Migration is progressive:

1. When a subject has an applicable spec entity, that entity is authoritative.
2. Legacy contract prose remains valuable for rationale, examples, timelines, and detailed explanation.
3. When no entity catalogs a subject yet, a legacy contract may be used as a transitional fallback after checking implementation, tests, and recent records.
4. A legacy document must not silently override an entity. Resolve drift by updating the projection, changing the entity through normal review, or explicitly recording an unresolved gap.
5. Stable conclusions from `internal/records/**` should be promoted into the appropriate entities; records themselves remain non-normative.

The migration is complete only when the relevant behavior, identity, relations, and executable coverage can be traced through the catalog. File counts alone are not a completion criterion.

## Authoring workflow

Before adding or changing an entity:

1. Search existing IDs, criteria, aliases, tags, and relations for the concept.
2. Read the corresponding implementation, executable tests, legacy contracts, and recent records.
3. Decide whether the change belongs in an existing entity, a new entity, a schema decision, or a non-normative record.
4. Model one coherent semantic slice. Do not batch-create empty module or host-cap identities from package/token inventories.
5. Add criteria and relations precise enough to trace expected behavior.
6. For normative behavior, add or update a `T-*` mapping and executable implementation path.
7. Add an appropriate revision when changing semantics already available in a version.
8. Regenerate projections and run validation.

Use localized text objects when both Chinese and English expressions carry project meaning. Preserve canonical API names and entity IDs in English/code form.

## Validation and projections

The schema is defined in `packages/spec/schema/src/index.ts`. Directory loading and workspace relation validation live in `packages/spec/engine/src/node.ts`.

Useful commands:

```sh
corepack pnpm@10.32.1 check:prototype-catalog
corepack pnpm@10.32.1 spec:docs:agent
corepack pnpm@10.32.1 check:agent-doc
corepack pnpm@10.32.1 check:types
corepack pnpm@10.32.1 test
```

Important projections include:

- `apps/workspace/public/spec-workspace.json`, generated for the internal workspace UI;
- release snapshots under `artifacts/spec-releases/` when created by the release workflow;
- `internal/agent/PROJECT-UNDERSTANDING.zh-CN.md`, generated locally for Agent orientation and intentionally ignored by Git.

Generated views are disposable projections. Change the entities or the generator, then regenerate; do not hand-edit or commit a local generated view.
