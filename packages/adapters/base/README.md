# @proto.ui/adapter-base

Base package for building Proto UI adapters.

## Purpose

Provides the base template, shared host wiring, and common runtime bridges for building Proto UI adapters.

## Package Role

Adapter foundation package used to translate Proto UI contracts into concrete host integrations.

## Lifecycle ownership

`createAdapterHost()` owns one explicit `RuntimeSession`; it no longer executes through the legacy eager `executeWithHost()` wrapper.

`createViewEpochOwner()` separates that terminal owner from replaceable host views:

- the owner retains the Proto instance, logical token, module state, and host wiring;
- `attachView()` binds or rebinds one view epoch and mounts the same session;
- `detachView()` unmounts the epoch and releases its router/listeners/DOM bindings;
- `dispose()` terminates the owner and the Proto instance exactly once.

React uses deferred owner disposal to distinguish StrictMode effect replay from terminal component removal. Vue maps KeepAlive activation/deactivation to the same attach/detach model.

## Install

```bash
npm install @proto.ui/adapter-base@0.0.1
```

## Internal Structure

- `src/events/`
- `src/gate/`
- `src/host/`
- `src/index.ts`
- `src/lifecycle/`
- `src/types.ts`
- `src/wiring/`

## Related Internal Packages

- `@proto.ui/core`
- `@proto.ui/runtime`
- `@proto.ui/types`

## License

MIT
