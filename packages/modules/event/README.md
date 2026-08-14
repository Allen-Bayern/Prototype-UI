# @proto.ui/module-event

Proto UI module for setup-time Event registration, runtime dispatch planning, scoped binding lifetime, and precise listener removal.

## Purpose

The standard runtime projects the author facade as `def.event.on`, `def.event.onGlobal`, and token-based `def.event.off`. Runtime, modules, and privileged hooks consume a separate port for internal listeners, binding, root redirection, default-action requests, and diagnostics.

Adapters provide the host interaction capabilities needed by the registrations a prototype actually declares. With no registrations, Event binding is a no-op and no root or global target is required.

## Package Role

Runtime module package with distinct author-facade, privileged-port, and host-capability boundaries. Concrete native event routing remains adapter-owned; the portable contract does not require prototype authors to access DOM `EventTarget`, `window`, or native event objects.

The currently co-located Expose Event registry and emission bridge are consumed as Expose functionality and do not create a prototype-author `run.event` API.

The machine-governed entity for this package is `spec/modules/M-EVENT-0001.yaml`.

## Install

```bash
npm install @proto.ui/module-event@0.2.0-rc.7
```

## Internal Structure

- `src/caps.ts`
- `src/create.ts`
- `src/error.ts`
- `src/impl.ts`
- `src/index.ts`
- `src/kernel.ts`
- `src/types.ts`

## Related Internal Packages

- `@proto.ui/core`
- `@proto.ui/module-base`
- `@proto.ui/types`

## License

MIT
