# D-ANATOMY-MISSING-POLICY-0001

Anatomy missing query policy exists to tolerate transient invalid-domain windows, not to express semantic optionality.

It is currently useful for structural projection helpers such as `useCollection` and `useCollectionItem`, where a read model can temporarily return `null` or `[]` until the structure becomes valid again. That does not mean the anatomy relationship is optional in the way `context.try*` is optional.

Resolution direction:

- Keep ordinary author-facing anatomy queries strict by default.
- Treat `missing: 'null' | 'empty'` as internal or privileged until there is a deliberate public API design.
- If it becomes public, document it as a query policy for transient structure reads, not as a semantic optionality marker.
