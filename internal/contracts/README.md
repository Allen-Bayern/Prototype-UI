# Internal contract documents

`internal/contracts/**` is Proto UI's former primary contract layer. The project is progressively replacing it with the machine-governed entity catalog under `spec/**`, but the migration is not complete and these documents have not fully retired.

They currently serve two roles:

1. Human-readable projections and background for subjects already cataloged in spec. They retain rationale, examples, timelines, implementation notes, and historical context that do not belong in compact entities.
2. Transitional fallback references for subjects that have not yet been completely cataloged.

The applicable spec entity always takes precedence:

- `spec/contracts/**` defines normative cross-cutting rules.
- `spec/prototypes/**` defines official prototype identities and protocols.
- `spec/modules/**` and `spec/host-caps/**` define cataloged implementation and host identities.
- `spec/decisions/**` records stabilized choices.
- `spec/tests/**` maps conformance cases and executable coverage.

When a subject is only partially cataloged, use the following process:

1. Identify exactly which facts are already covered by spec entities and their lifecycle status.
2. Use legacy contract text only for the remaining gap or for explanation.
3. Cross-check the fallback against implementation, executable tests, and relevant recent records.
4. State the gap explicitly; do not present uncataloged prose as if it were an active spec guarantee.
5. Promote stable semantics into the appropriate entities and update the readable document as a projection.

When an internal document and an applicable entity disagree, treat the difference as drift. Update the document, propose a reviewed entity change, or record the unresolved contradiction; do not treat the document as an independent competing contract.

Historical or version-specific material may remain when it is clearly labeled and still helps explain how the current model evolved. A legacy document is fully retired only when its current semantics and coverage are traceable through the entity catalog; moving or deleting files is a separate archival decision.
