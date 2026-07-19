import { describe, expect, it } from 'vitest';

import { createSpecWorkspace, getSpecReleases } from '@proto.ui/spec-engine';
import { compareSpecVersions, validateSpecEntity } from '@proto.ui/spec-schema';

const draftRelease = {
  id: 'V-PROTO-UI-0001',
  type: 'version',
  title: 'Proto UI 0.2.0-rc.0',
  status: 'draft',
  since: '0.2.0-rc.0',
  release: {
    version: '0.2.0-rc.0',
    channel: 'prerelease',
    gitTag: 'v0.2.0-rc.0',
    npmDistTag: 'next',
    packageVersionPolicy: 'exact',
    packageScope: 'public-@proto.ui',
  },
};

describe('version release entities', () => {
  it('catalogs a draft prerelease as the workspace release source', () => {
    const entity = validateSpecEntity(draftRelease);
    const releases = getSpecReleases(createSpecWorkspace([entity]));

    expect(releases).toEqual([
      {
        entityId: 'V-PROTO-UI-0001',
        status: 'draft',
        version: '0.2.0-rc.0',
        channel: 'prerelease',
        gitTag: 'v0.2.0-rc.0',
        npmDistTag: 'next',
        packageVersionPolicy: 'exact',
        packageScope: 'public-@proto.ui',
        publishedAt: undefined,
        commit: undefined,
        specSnapshotDigest: undefined,
      },
    ]);
  });

  it('rejects release metadata on non-version entities', () => {
    expect(() =>
      validateSpecEntity({
        ...draftRelease,
        id: 'D-RELEASE-VERSION-0001',
        type: 'decision',
      })
    ).toThrow(/Only version entities may declare release metadata/);
  });

  it('requires publication evidence before a version becomes active', () => {
    expect(() => validateSpecEntity({ ...draftRelease, status: 'active' })).toThrow(
      /Active version entities must declare/
    );
  });

  it('requires the channel dist-tag declared by version governance', () => {
    expect(() =>
      validateSpecEntity({
        ...draftRelease,
        release: { ...draftRelease.release, npmDistTag: 'latest' },
      })
    ).toThrow(/npmDistTag must be next/);
  });

  it('sorts prerelease identifiers with semver precedence', () => {
    expect(compareSpecVersions('0.2.0-rc.10', '0.2.0-rc.2')).toBeGreaterThan(0);
    expect(compareSpecVersions('0.2.0-rc.1', '0.2.0-rc.1.1')).toBeLessThan(0);
    expect(compareSpecVersions('0.2.0-1', '0.2.0-rc.0')).toBeLessThan(0);
    expect(compareSpecVersions('0.2.0', '0.2.0-rc.10')).toBeGreaterThan(0);
  });
});
