#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

import { getSpecReleases, getSpecSnapshot } from '@proto.ui/spec-engine';
import { loadSpecWorkspaceFromDirectory } from '@proto.ui/spec-engine/node';

import { findProtoPackages, getRoot, readVersion } from '../release/version-utils.mjs';

const root = getRoot();
const version = readVersion(root);
const outDir = resolve(root, readOutDir(process.argv.slice(2)));
const workspace = await loadSpecWorkspaceFromDirectory(join(root, 'spec'));

if (workspace.issues.length > 0) {
  throw new Error(`Cannot snapshot a spec workspace with ${workspace.issues.length} issue(s)`);
}

const releases = getSpecReleases(workspace);
const release = releases.find((entry) => entry.version === version.raw);
if (!release) {
  throw new Error(`No V entity declares VERSION ${version.raw}`);
}

const packages = findProtoPackages(root)
  .map((pkg) => ({ name: pkg.manifest.name, version: pkg.manifest.version }))
  .sort((a, b) => a.name.localeCompare(b.name));
const mismatched = packages.filter((pkg) => pkg.version !== version.raw);
if (mismatched.length > 0) {
  throw new Error(
    `Cannot snapshot mismatched public package versions: ${mismatched
      .map((pkg) => `${pkg.name}@${pkg.version}`)
      .join(', ')}`
  );
}

const snapshot = getSpecSnapshot(workspace, version.raw);
const artifact = {
  format: 'proto-ui-spec-release-snapshot-v1',
  version: version.raw,
  release,
  publicPackages: packages,
  entities: snapshot.entities,
};
const contents = `${JSON.stringify(artifact, null, 2)}\n`;
const digest = createHash('sha256').update(contents).digest('hex');
const snapshotPath = join(outDir, `spec-snapshot-${version.raw}.json`);
const checksumPath = `${snapshotPath}.sha256`;

mkdirSync(outDir, { recursive: true });
writeFileSync(snapshotPath, contents);
writeFileSync(checksumPath, `${digest}  ${basename(snapshotPath)}\n`);

// Read the file back so this command also verifies the bytes whose digest it reports.
const writtenDigest = createHash('sha256').update(readFileSync(snapshotPath)).digest('hex');
if (writtenDigest !== digest) throw new Error('Release snapshot digest changed while writing');

console.log(`spec release snapshot: ${snapshotPath}`);
console.log(`spec release digest: sha256:${digest}`);

function readOutDir(argv) {
  let outDir = 'artifacts/spec-releases';
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--') continue;
    if (arg === '--out-dir') {
      const value = argv[++index];
      if (!value) throw new Error('--out-dir requires a value');
      outDir = value;
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: pnpm spec:snapshot:release [--out-dir <path>]');
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return outDir;
}
