# D-CONTEXT-PROVIDER-SELF-SUBSCRIBE-0001

Context v0 keeps the current provider self-subscription behavior: resolution starts at the current instance, so a provider subscribing to the same key it provides resolves to its own context scope.

This is acceptable for current usage and matches the existing implementation. It does leave a future API gap for components that both provide a key and need to subscribe to an outer same-key context, such as TreeNode-like recursive structures.

Potential future APIs include `subscribeProvided(key)` for the provider's own scope and `subscribeOuter(key)` or `subscribeParent(key)` for skipping the current provider and resolving an outer scope. No such API is introduced in v0.
