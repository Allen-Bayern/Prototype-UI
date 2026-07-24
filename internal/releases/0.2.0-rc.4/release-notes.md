# Proto UI 0.2.0-rc.4

> Release candidate draft prepared for review. This train aligns every public package and its reviewed release assets to `0.2.0-rc.4`, but it has not been published. Current installation and trial instructions therefore remain pinned to the published `0.2.0-rc.3` until immutable rc.4 evidence exists.

## Fixed

### Web Component Tabs Content rematerialization

- Web Component Tabs Content now becomes visible again after a previously visited panel follows the default `current -> inactive -> current` L1 lifecycle.
- The affected Proto instance and its `current` state were already preserved correctly. The disappearing panel was caused by a stale native `hidden` attribute left on the persistent custom-element owner when a fresh view epoch was revealed.
- Web Component accessibility projection may now apply the latest semantic snapshot while a rematerialized host is still protected by the reveal barrier. Focus projection remains gated until that host is ready for interaction.
- Generic L1 accessibility replay coverage and a Shadcn Tabs `A -> B -> A` Web Component integration test protect both the lifecycle boundary and the reported user path.

## Still under validation

- Additional installation, runtime, CSS, accessibility, bundle, composition, and API findings from post-publication `0.2.0-rc.3` trials.
- npm publication, the `v0.2.0-rc.4` tag, GitHub prerelease, and immutable spec snapshot remain pending until this draft release train is reviewed and merged.
