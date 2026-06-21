# D-CONTEXT-UPDATE-API-0001

Context v0 keeps separate `update(key, next)` and `tryUpdate(key, next)` runtime APIs.

`update` is the required-context form: the prototype author is asserting that the context should exist. Missing provider or missing prior subscription is an error.

`tryUpdate` is the optional-context form: the prototype author accepts that the context may be absent. Absence returns `false` and performs no update.

The two APIs could be merged mechanically, but keeping both mirrors `subscribe` / `trySubscribe` and makes the author's dependency strength explicit.
