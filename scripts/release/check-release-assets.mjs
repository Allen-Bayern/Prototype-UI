#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';

import { getAllPackages, ROOT_DIR, selectPackages, topoSortPackages } from './lib.mjs';
import { loadLaunchPackageGovernance } from './governance.mjs';
import { readVersion } from './version-utils.mjs';

const args = parseArgs(process.argv.slice(2));
const version = readVersion();
const releaseDir = join(ROOT_DIR, 'internal', 'releases', version.raw);
const bomPath = join(releaseDir, 'package-bom.json');
const notePaths = [
  join(releaseDir, 'release-notes.md'),
  join(releaseDir, 'release-notes.zh-CN.md'),
];
const selectedPackages = topoSortPackages(selectPackages(getAllPackages()));
const expectedBom = createBom(selectedPackages);
const prettierConfig = (await resolveConfig(bomPath)) ?? {};
const expectedContents = await format(JSON.stringify(expectedBom), {
  ...prettierConfig,
  filepath: bomPath,
  parser: 'json',
});

if (args.write) {
  mkdirSync(releaseDir, { recursive: true });
  writeFileSync(bomPath, expectedContents);
  console.log(`release package BOM: wrote ${bomPath}`);
}

const violations = [];
if (!existsSync(bomPath)) {
  violations.push(`missing package BOM: ${bomPath}`);
} else if (readFileSync(bomPath, 'utf8') !== expectedContents) {
  violations.push(`package BOM is stale: run pnpm release:bom`);
}

for (const notePath of notePaths) {
  if (!existsSync(notePath)) {
    violations.push(`missing release note: ${notePath}`);
    continue;
  }
  const contents = readFileSync(notePath, 'utf8');
  if (!contents.includes(version.raw)) {
    violations.push(`release note does not name ${version.raw}: ${notePath}`);
  }
}

const requiredAttribution = new Map([
  ['@proto.ui/prototypes-lucide', ['Lucide Icons and Contributors', 'Cole Bemis']],
  ['@proto.ui/prototypes-shadcn', ['Copyright (c) 2023 shadcn']],
]);
const packagesByName = new Map(selectedPackages.map((pkg) => [pkg.name, pkg]));
for (const [packageName, requiredMarkers] of requiredAttribution) {
  const pkg = packagesByName.get(packageName);
  if (!pkg) {
    violations.push(`missing attributed release package: ${packageName}`);
    continue;
  }

  const noticeFiles = pkg.manifest.protoUi?.release?.thirdPartyNotices;
  if (!Array.isArray(noticeFiles) || noticeFiles.length === 0) {
    violations.push(`${packageName} must declare protoUi.release.thirdPartyNotices`);
    continue;
  }

  const noticeContents = [];
  for (const noticeFile of noticeFiles) {
    const noticePath = join(pkg.dir, noticeFile);
    if (!existsSync(noticePath)) {
      violations.push(`${packageName} declares missing third-party notice: ${noticeFile}`);
      continue;
    }
    noticeContents.push(readFileSync(noticePath, 'utf8'));
  }

  const combinedNotice = noticeContents.join('\n');
  for (const marker of requiredMarkers) {
    if (!combinedNotice.includes(marker)) {
      violations.push(`${packageName} third-party notice is missing attribution: ${marker}`);
    }
  }
}

if (violations.length > 0) {
  console.error(`check-release-assets: ${violations.length} violation(s)`);
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(
  `check-release-assets: ${version.raw}, ${expectedBom.packageCount} packages, release notes present`
);

function createBom(selected) {
  const governance = loadLaunchPackageGovernance();
  const releaseRoles = new Map();

  register(governance.launchCommitmentPackages, 'launch-commitment');
  register(governance.publicNonLaunchCommitmentPackages, 'public-non-launch-commitment');
  register(governance.internalOrDependencyDirectedPackages, 'internal-or-dependency-directed');
  for (const candidate of governance.candidatePackages ?? []) {
    register([candidate.name], `candidate-${candidate.status ?? 'pending'}`);
  }

  const selectedNames = new Set(selected.map((pkg) => pkg.name));
  const missingRoles = selected.filter((pkg) => !releaseRoles.has(pkg.name));
  const extraRoles = [...releaseRoles.keys()].filter((name) => !selectedNames.has(name));
  if (missingRoles.length > 0 || extraRoles.length > 0) {
    const diagnostics = [];
    if (missingRoles.length > 0) {
      diagnostics.push(`unclassified: ${missingRoles.map((pkg) => pkg.name).join(', ')}`);
    }
    if (extraRoles.length > 0) diagnostics.push(`not selected: ${extraRoles.join(', ')}`);
    throw new Error(`Package BOM governance mismatch (${diagnostics.join('; ')})`);
  }

  return {
    format: 'proto-ui-package-bom-v1',
    releaseVersion: version.raw,
    gitTag: `v${version.raw}`,
    npmDistTag: version.isPrerelease ? 'next' : 'latest',
    packageVersionPolicy: 'exact',
    packageScope: 'public-@proto.ui',
    packageCount: selected.length,
    packages: selected.map((pkg, index) => ({
      name: pkg.name,
      version: version.raw,
      path: pkg.relDir,
      releaseRole: releaseRoles.get(pkg.name),
      publishOrder: index + 1,
      internalDependencies: [...pkg.internalDeps].sort(),
    })),
  };

  function register(names = [], role) {
    for (const name of names) {
      if (!name) continue;
      if (releaseRoles.has(name)) {
        throw new Error(`Package ${name} has multiple release roles`);
      }
      releaseRoles.set(name, role);
    }
  }
}

function parseArgs(argv) {
  let write = false;
  for (const arg of argv) {
    if (arg === '--write') write = true;
    else if (arg === '--check') continue;
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/release/check-release-assets.mjs [--check | --write]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return { write };
}
