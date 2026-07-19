import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createPublishManifest, parseArgs } from '../lib.mjs';

test('partial recovery is an explicit release argument', () => {
  assert.equal(parseArgs([]).resumePublished, false);
  assert.equal(parseArgs(['--resume-published']).resumePublished, true);
});

test('tarball packing is an explicit release argument', () => {
  assert.equal(parseArgs([]).pack, false);
  assert.equal(parseArgs(['--pack']).pack, true);
});

test('workspace dependencies use exact package versions in published manifests', () => {
  const manifest = createPublishManifest(
    {
      name: '@proto.ui/adapter-react',
      version: '0.1.1',
      manifest: {
        name: '@proto.ui/adapter-react',
        version: '0.1.1',
        type: 'module',
        dependencies: {
          '@proto.ui/core': 'workspace:*',
          '@proto.ui/runtime': 'workspace:*',
        },
        peerDependencies: {
          '@proto.ui/types': 'workspace:*',
        },
        exports: {
          '.': {
            types: './src/index.ts',
            default: './src/index.ts',
          },
        },
      },
    },
    {
      access: 'public',
      packageVersions: new Map([
        ['@proto.ui/adapter-react', '0.1.1'],
        ['@proto.ui/core', '0.1.0'],
        ['@proto.ui/runtime', '0.1.0'],
        ['@proto.ui/types', '0.1.0'],
      ]),
    }
  );

  assert.equal(manifest.version, '0.1.1');
  assert.equal(manifest.dependencies['@proto.ui/core'], '0.1.0');
  assert.equal(manifest.dependencies['@proto.ui/runtime'], '0.1.0');
  assert.equal(manifest.peerDependencies['@proto.ui/types'], '0.1.0');
});
