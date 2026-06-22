# D-ANATOMY-PARTVIEW-TARGET-0001

Author-facing Anatomy PartView must not expose prototype instances, host nodes, root targets, adapter targets, or any raw references.

The earlier implementation included a `getRootTarget()` entry on `AnatomyPartView`. That shape conflicted with the author-facing safety boundary: a prototype should not obtain its own target reference or another prototype's target reference through Anatomy.

Current resolution:

- `getRootTarget()` is removed from the public `AnatomyPartView` type and returned part view objects.
- Internal order logic may continue to use root target access through module-private claim records and host caps.
- Do not replace the removed PartView entry with another API that reveals raw target identity.
