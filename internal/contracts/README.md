# Internal contract documents

`internal/contracts/**` is the human-readable contract reference layer. These documents retain explanations, rationale, timelines, examples, and historical context that are useful to maintainers and agents.

The machine-governed source of truth is progressively moving to the entity catalog under `spec/**`:

- `spec/contracts/**` defines normative cross-cutting contracts.
- `spec/prototypes/**` defines prototype protocol entities.
- `spec/tests/**` maps executable coverage to those entities.

Internal documents should continue to be maintained as readable projections of the catalog. When an internal document and a spec entity disagree, the spec entity takes precedence; the document should then be updated rather than treated as an independent competing contract.

Historical or version-specific material may remain when it is clearly labelled and still helps explain how the current model evolved.
