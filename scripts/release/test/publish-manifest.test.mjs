import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createPublishManifest, parseArgs, writeSupportingFiles } from '../lib.mjs';

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
        sideEffects: false,
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
          './button': {
            types: './src/button/index.ts',
            default: './src/button/index.ts',
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
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.exports['.'].types, './dist/index.d.ts');
  assert.deepEqual(manifest.exports['./button'], {
    types: './dist/button/index.d.ts',
    default: './dist/button/index.js',
  });
});

test('declared package-local third-party notices enter the published tarball', (t) => {
  const packageDir = mkdtempSync(join(tmpdir(), 'proto-ui-notice-package-'));
  const stageDir = mkdtempSync(join(tmpdir(), 'proto-ui-notice-stage-'));
  t.after(() => {
    rmSync(packageDir, { recursive: true, force: true });
    rmSync(stageDir, { recursive: true, force: true });
  });

  const noticeFile = 'THIRD_PARTY_NOTICES.md';
  const noticeContents = '# Third-Party Notices\n\nUpstream notice.\n';
  const readmePath = join(packageDir, 'README.md');
  writeFileSync(readmePath, '# Fixture package\n');
  writeFileSync(join(packageDir, noticeFile), noticeContents);
  mkdirSync(join(stageDir, 'dist'));

  const pkg = {
    dir: packageDir,
    localReadme: readmePath,
    name: '@proto.ui/fixture',
    version: '0.2.0-rc.0',
    manifest: {
      name: '@proto.ui/fixture',
      version: '0.2.0-rc.0',
      protoUi: {
        release: {
          thirdPartyNotices: [noticeFile],
        },
      },
    },
  };

  const manifest = createPublishManifest(pkg, { access: 'public' });
  assert.deepEqual(manifest.files, ['dist', 'README.md', 'LICENSE', noticeFile]);

  writeSupportingFiles(pkg, stageDir);
  assert.equal(readFileSync(join(stageDir, noticeFile), 'utf8'), noticeContents);
});
