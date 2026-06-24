# D-CONTEXT-NOTIFICATION-SCHEDULING-0001

The older context contract described callback notifications as synchronous and unmerged. The current v0 contract keeps the semantic part and relaxes the scheduling part.

Every successful context update must remain observable as a semantic transition. A delivered callback must receive the `next` and `prev` values for that transition, and ordering inside the same dispatch window must be deterministic.

However, the contract does not require every adapter to dispatch immediately and synchronously. Runtime or adapter scheduling may batch or align delivery with host loops as long as it does not drop updates, merge distinct semantic updates incorrectly, or change callback semantics.
