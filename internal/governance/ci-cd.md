# Proto UI CI/CD Guide

This document describes the repository's GitHub Actions workflows and how they relate to global exact-version and launch-package governance.

The current release train is `0.2.0-rc.0`; no release date is committed yet.

## Workflows

| Workflow | File | Purpose |
| --- | --- | --- |
| CI | `.github/workflows/ci.yml` | Type, test, spec, and global-version gates for pull requests and `main` |
| Release Packages | `.github/workflows/release-packages.yml` | Manual release scan, stage rehearsal, or full-set publication |
| Release Cadence | `.github/workflows/release-cadence.yml` | Periodic reminder based on the latest `v*` release tag |

## CI Workflow (`ci.yml`)

CI runs for pull requests, pushes to `main`, and manual dispatch. In addition to type and test checks, `check-version-governance` verifies that:

- root `VERSION` exactly matches every public `@proto.ui/*` package
- exactly one V entity declares the current version
- entity version references from `0.2.0-rc.0` onward resolve to declared V entities
- the launch-governance release line matches the current version

Every new numeric version must therefore be a reviewed release train; a package-local bump cannot bypass the gate.

## Release Workflow (`release-packages.yml`)

The workflow is triggered manually through `workflow_dispatch`.

### Inputs

- `mode`: `scan` / `stage` / `publish-all`
- `profile`: `workspace` / `launch`
- `include_approved_candidates`: affects only the launch audit set
- `resume_published`: partial-release recovery only; skips only identical published tarballs
- `publish_delay_ms`, `max_publish_retries`, `retry_delay_ms`: npm rate-limit controls

The workflow does not accept ad hoc `version`, `tag`, or `only` inputs. Version and dist-tag come from reviewed repository state: prereleases use `next`, while stable releases use `latest`.

### Safety Rules

- `publish-all` is allowed only on `main`.
- `publish-all` requires the `workspace` profile; `launch` is for product-scope audit and rehearsal only.
- Real publication is protected by the GitHub `npm` environment and npm Trusted Publishing through OIDC.
- Concurrency prevents overlapping release runs for the same ref.
- The workflow creates `v<version>` only after every public package publishes successfully.

## Launch Governance And The Publish Set

`internal/governance/launch-package-governance.json` defines priorities for the launch product promise, documentation, and smoke coverage.

- `--profile launch` checks launch commitment and candidate packages from that file.
- `--include-approved-candidates` expands only the launch audit set.
- `--check-governance` verifies that every workspace package is classified.

These tiers do not control the real npm publish set. Global exact-version governance requires the `workspace` profile to publish every public `@proto.ui/*` package together.

## Suggested Release Runbook

1. Create or update the draft V entity and align `VERSION` plus package manifests in one PR.
2. Run `pnpm check:release-version` and `pnpm release:scan:launch`; review the launch product scope.
3. Run `pnpm release:stage` to rehearse the final tarballs for every public package.
4. After merge to `main`, run `publish-all` with the `workspace` profile.
5. Verify the GitHub release/spec-snapshot evidence and promote the V entity to `active` in a follow-up PR.

## Local Shortcuts

- `pnpm check:release-version`
- `pnpm release:scan:launch`
- `pnpm release:stage:launch`
- `pnpm release:stage`

There is no package-local real-publish shortcut. Package-local fixes enter the next global release train.
