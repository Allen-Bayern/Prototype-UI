# D-ANATOMY-FAMILY-DERIVE-0001

Anatomy v0 does not introduce OOP-style family inheritance or derivation.

Profiles are enough for the currently expected compound prototype cases: they allow a named same-family refinement to tighten cardinality, add requirements, or add stricter relations. If a structure needs a wider semantic break than profile refinement can express, the recommended path is to define a new anatomy family.

Resolution direction:

- Keep profile as same-family refinement, not cross-family inheritance.
- Do not add a `deriveAnatomyFamily`-style API in v0.
- If future families require polymorphic querying across base and derived families, revisit this as a separate design rather than overloading profile semantics.
