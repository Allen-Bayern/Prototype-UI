# Proto UI 0.2.0-rc.0

`0.2.0-rc.0` is the first Proto UI release candidate governed as one exact ecosystem release. Every public `@proto.ui/*` package, its internal package edges, the Git tag, and the spec snapshot share the same version.

This is a prerelease for external trial, not the stable `latest` onboarding path.

## What to validate

- The CLI can initialize an existing project and add component facades one family at a time.
- React, Vue, and Web Component adapters can consume the same prototype protocols.
- Base and Shadcn prototype families remain independently importable; adding one family should not pull unrelated prototype families into the consumer bundle.
- The CLI pins Adapter and Prototype packages to its own exact release version, preventing mixed release trains.
- The current Prototype catalog connects public `.proto.ts` declarations to P and T entities, including standalone Transition behavior and its reduced-motion fallback.

## Try the exact RC

After this version is available from npm:

```bash
npx @proto.ui/cli@0.2.0-rc.0 init
npx @proto.ui/cli@0.2.0-rc.0 add react shadcn-button
```

Follow the [0.2 RC Trial](https://www.proto-ui.com/en/start-here/rc-trial/) for the complete flow. The main Quick Start continues to track the stable npm `latest` channel.

## Current boundaries

- APIs and generated structure may still change before `0.2.0` stable.
- The CLI currently installs official Prototype packages and generates local component facades; it does not yet copy styled prototype source into the consumer project for editing.
- Shadcn compatibility is intentional but not complete. Proto UI deliberately does not expose Radix-style `asChild`; known compatibility differences remain prerelease feedback targets.
- Documentation, external-project evidence, and bundle composition analysis are still incomplete. Adapter size is treated as an architectural cost for this RC, while prototype families are expected to preserve on-demand import boundaries.

Please report installation, type, runtime, SSR, CSS, accessibility, bundle, or API-escape findings in [GitHub Issues](https://github.com/Proto-UI/Proto-UI/issues).

## Release evidence

The GitHub release attaches the reviewed package BOM and deterministic spec snapshot. The V entity remains `draft` until npm publication, the `v0.2.0-rc.0` tag, and snapshot digest are all verified and recorded in a follow-up evidence change.
