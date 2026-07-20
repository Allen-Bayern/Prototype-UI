# Proto UI Release Workflow

> Internal governance document. This policy defines globally exact release preparation, verification, publication, and evidence capture starting with `0.2.0-rc.0`.

## 1. Authoritative State

`main` is the only source for release tags and real publication. Ordinary work uses short-lived topic branches and pull requests; release identity no longer depends on a long-lived `feat/v0-release-prep` branch.

One release is jointly identified by:

- one `V-*` version entity
- root `VERSION`
- the exact version of every public `@proto.ui/*` package
- a `v<version>` Git tag
- npm dist-tag and published package set
- the corresponding spec snapshot and digest

A release is incomplete whenever any of these facts disagree.

## 2. V Entity Lifecycle

### 2.1 Draft

When maintainers open a release train, they first create or update a `draft` V entity. It fixes:

- exact semver, including any prerelease suffix
- Git tag such as `v0.2.0-rc.0`
- npm dist-tag: `next` for prereleases and `latest` for stable releases
- `packageVersionPolicy: exact`
- the public package scope

`VERSION` and every public package manifest must project that version in the same PR. Entity revisions may reference a draft V version, but the workspace must visibly treat it as draft rather than published.

### 2.2 Active

A V entity becomes `active` only after npm packages, the Git tag, and the spec snapshot are published. Active entities must record:

- publication time
- the 40-character release commit SHA
- the `sha256` spec snapshot digest

## 3. Preparation

1. Create a topic branch from current `main`.
2. Create the draft V entity and update `VERSION`.
3. Use `stamp-version` to align every public package exactly.
4. Update release notes, package BOM, spec snapshot, and governance maps.
5. Run version governance, spec, types, tests, release scan, and tarball consumer smoke.
6. Merge through pull request review.

The main Quick Start always follows npm `latest` and must not silently switch ordinary users to a prerelease. A separate prerelease trial page must pin the exact V-entity version for reproducible verification; `@next` may remain a convenience channel but is not the recorded test identity. When the CLI installs Adapter and Prototype packages, it must pin each package spec to the CLI's own exact version and save an exact dependency in the consumer manifest. An unversioned `latest` resolution or an automatically widening semver range must not mix another release train into the project.

Package-local fixes do not use `publish-single`; they enter the next global release train.

Each release train owns `internal/releases/<version>/release-notes.md`, its Chinese projection, and a deterministic `package-bom.json`. `pnpm release:bom` regenerates the BOM from the public workspace package graph and launch-governance roles; `pnpm release:assets:check` fails when the reviewed BOM drifts or either release note is absent. The English note becomes the GitHub Release body, while the BOM, Chinese note, spec snapshot, and checksum are attached as release evidence.

## 4. Publication

Real publication is manually triggered from `main` and protected by the GitHub `npm` environment approval.

The workflow:

1. reads `VERSION` from the repository and accepts no temporary version override
2. runs `check-version-governance` and the launch governance scan
3. stages every public package and rewrites workspace dependencies to the same exact version
4. publishes the complete package set using the V entity npm dist-tag
5. creates `v<version>` only after every package succeeds
6. produces the GitHub prerelease/release and spec snapshot artifact
7. uses a follow-up evidence PR to record publication time, tagged commit, and snapshot digest, then activates the V entity

The publish workflow does not rewrite the V entity on `main`. The tag therefore points to the reviewed draft release identity, while `active` arrives as a separately reviewable post-publication fact. The V entity's snapshot digest refers to the immutable draft snapshot attached to the tag, avoiding a digest that recursively includes itself.

If publication is partial, the workflow must not advance dist-tags or activate the V entity. Recovery still runs the complete workspace release set with `resume_published` explicitly enabled. It skips an existing registry package only when its SHA-512 integrity exactly matches the current staged tarball, publishes missing packages at the same version, and aborts on any mismatch. The actual registry state must be recorded with the recovery.

## 5. First Unified Version

The first version governed by this workflow is:

- version: `0.2.0-rc.0`
- Git tag: `v0.2.0-rc.0`
- npm dist-tag: `next`

Historical `0.1.x` package versions are fragmented releases from before global lockstep. The highest local version, `@proto.ui/cli@0.1.4`, does not establish a global `v0.1.4` and must not be retroactively tagged as one.

## 6. Required Checks

- `pnpm check:release-version`
- `pnpm release:assets:check`
- `pnpm release:scan:launch`
- `pnpm release:stage`
- zero spec workspace issues
- repository types and tests
- current-source tarball consumer smoke
- Quick Start commands matching the verified install path

`pnpm release:rehearse` is the non-publishing, one-command preparation gate. It runs the identity and asset checks, catalog and test suites, type checks, a temporary spec snapshot, launch scan, package publish dry-run, React and multi-host CLI tarball consumer smokes, and the documentation build. It may access the npm registry for dry-run or temporary consumer dependency installation, but it never invokes the real publish path.

Docs-only or private-app changes do not need to publish immediately. Creating a new numeric version or changing `VERSION`, however, must enter this release-train workflow.
