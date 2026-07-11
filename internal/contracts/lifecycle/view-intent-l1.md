# L1 View Intent and Materialization

> **Human-readable reference projection.** The normative source is `spec/contracts/C-LIFECYCLE-0008.yaml`. The target Base Tabs default is recorded separately in `spec/decisions/D-BASE-TABS-L1-MATERIALIZATION-0001.yaml`.

## Scope

L1 releases a Proto instance's current host view while retaining its terminal owner and logical instance:

```text
Host component owner: retained
Proto instance: retained and alive
Host view epoch: replaceable or absent
```

L1 does not snapshot or recreate a disposed Proto instance. That colder restoration model is a separate future capability.

## Three independent axes

View intent must not introduce a second lifecycle state machine:

| Axis | Owner | Examples |
| --- | --- | --- |
| desired view presence | instance-owned ViewIntent | `mounted`, `detached` |
| actual view phase | RuntimeSession and adapter owner | `detached`, `mounting`, `mounted`, `unmounting` |
| perceptual transition | prototype policy such as `asTransition` | `closed`, `entering`, `entered`, `leaving` |

The intent is a desired target, not proof that a view exists. Actual phase changes only through RuntimeSession. Perceptual transition policy is designed separately and cannot fabricate lifecycle completion.

## Ownership and reconciliation

The default lifecycle owner is the host component instance. It creates one Proto instance, may attach and detach multiple host view epochs, and performs terminal disposal when the owner itself terminates.

An adapter owner reconciles the latest ViewIntent:

```text
desired=mounted
  -> ensure a host view exists
  -> bind view capabilities
  -> RuntimeSession.mount()

desired=detached
  -> RuntimeSession.unmount()
  -> release view-owned resources

terminal owner teardown
  -> ignore intent
  -> RuntimeSession.dispose()
```

Intent versions and lifecycle epochs make stale asynchronous attach, detach, and commit work inert.

## Prototype author boundary

Prototype authors update intent from callback-time `run` APIs:

```ts
def.lifecycle.onCreated((run) => {
  run.lifecycle.setPresent(active);
});
```

`run.lifecycle.setPresent()` updates desired view presence. It does not expose RuntimeSession, an adapter bridge, actual mount/unmount commands, or terminal disposal. Ordinary prototypes that do not call it retain eager materialization through the default present intent.

The method is callback-only. It is unavailable during setup and render, and it cannot revive an instance after terminal disposal begins.

## Initial reconciliation

The adapter owner must not reconcile the default present intent before created callbacks finish:

```text
setup
  -> instance alive
  -> created callbacks may call run.lifecycle.setPresent(...)
  -> initial intent is settled
  -> adapter owner performs first reconciliation
  -> optional render, commit, and mount
```

This ordering lets an initially inactive instance remain alive and detached without creating a throwaway first view epoch.

## Preservation boundary

Repeatable detach preserves the current Proto instance's setup result, declared state, props, logical context identity, and exposes. It releases view-owned resources such as host elements, event routes, observers, focus bindings, accessibility projection, and portals.

L1 does not guarantee preservation of host child-component instances rendered inside the detached view, uncontrolled native element state, DOM selection, scroll position, media playback position, or other platform-local state. Those values must remain mounted, move to an external model, or later participate in a colder snapshot/restoration contract.

## Base Tabs target

Base Tabs Content will use L1 as follows:

| State or option                          | Desired view                   |
| ---------------------------------------- | ------------------------------ |
| current content                          | `mounted`                      |
| inactive content, default                | `detached`                     |
| inactive content with `keepMounted=true` | `mounted` and projected hidden |

This makes initial inactive content lazy and detaches content on exit by default while preserving the Tabs Content Proto instance. Existing `lazyMount` and `unmountOnExit` props remain implementation-era surfaces until the Tabs migration step decides their removal or deprecation.
