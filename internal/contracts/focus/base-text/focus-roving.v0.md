# focus-roving.v0.md

> Status: Draft - v0
>
> This document defines the v0 contract direction for `asFocusRoving(...)`.

---

## 0. Positioning

`asFocusRoving(...)` declares that the current prototype instance owns sibling-local focus navigation.

It is responsible for:

- configuring local navigation policy
- exposing first/last/next/prev/selected movement commands
- representing roving focus semantics independently of scope boundaries

It is not responsible for:

- trap or restore behavior
- scope/container entry policy
- making child nodes focusable by itself

---

## 1. Relationship to FocusScope

`asFocusRoving(...)` is a sibling privileged asHook to `asFocusScope(...)`.

- a focus scope may internally expose a roving focus handle
- a roving focus owner may exist without declaring a focus scope boundary

`asFocusScope(...)` may expose its internal roving capability as a convenience surface, but that does not replace the standalone roving abstraction.

---

## 2. v0 Capabilities

v0 should minimally support:

- `navigation`
  - `none | tab | arrow | tab+arrow`
- `orientation`
  - `vertical | horizontal | both`
- `loop`
- `entry`
  - `first | selected | active | manual`
- `selectOnFocus`

---

## 3. Return Handle

`asFocusRoving(...)` should return a focus roving handle.

The current implementation keeps `FocusGroupHandle` only as a compatibility alias; the author-facing and implementation-preferred concept is roving focus.

Example shape:

```ts
type FocusRovingHandle = {
  active: ObservedStateHandle<boolean, any>;
  hasFocused: ObservedStateHandle<boolean, any>;

  focusFirst(): void;
  focusLast(): void;
  focusNext(): void;
  focusPrev(): void;
  focusSelected(): void;

  configure(patch: FocusRovingConfigPatch): void;
};
```

---

## 4. Non-Goals

v0 does not require:

- typeahead
- grid navigation
- activeDescendant public protocol
- cross-roving-owner querying

---

## 5. Legacy Naming

`asFocusGroup(...)` is absorbed by `asFocusRoving(...)`.

The old group name described a weak local focus group with its own navigation rules. That responsibility overlaps with roving focus, so v0 should keep only one author-facing concept for sibling-local focus navigation.
