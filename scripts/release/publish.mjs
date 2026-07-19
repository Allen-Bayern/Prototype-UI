import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, relative } from 'node:path';
import {
  buildPrerequisitePackages,
  ROOT_DIR,
  ensureCleanDir,
  getAllPackages,
  parseArgs,
  selectPackages,
  stagePackage,
  topoSortPackages,
} from './lib.mjs';
import { collectLaunchGovernanceDiagnostics, loadLaunchPackageGovernance } from './governance.mjs';
import { readVersion } from './version-utils.mjs';

function printHelp() {
  console.log(`Usage: node scripts/release/publish.mjs [options]

Options:
  --dry-run                     Run npm publish --dry-run against staged packages
  --pack                        Create installable tarballs for every staged package
  --publish                     Run npm publish for real
  --resume-published            Recovery only: skip an existing identical registry tarball
  --tag <tag>                   Override npm dist-tag for dry-run inspection only
  --otp <code>                  npm one-time password for accounts requiring 2FA
  --registry <url>              Custom npm registry
  --access <mode>               npm access, defaults to public
  --profile <name>              workspace (default) or launch
  --include-approved-candidates Include candidate packages marked approved
  --check-governance            Fail if governance map and workspace are out of sync
  --publish-delay-ms <ms>       Delay between package publish requests
  --max-publish-retries <n>     Retries when npm returns rate-limit errors
  --retry-delay-ms <ms>         Delay before each retry
  --include-legacy              Include packages under packages/legacy (workspace profile only)
  --include-test                Include test-only packages such as module-test-sys
  --only <list>                 Comma-separated package names or package paths
  --out-dir <path>              Staging directory, defaults to .codex/npm-release
`);
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.publish && args.profile !== 'workspace') {
  throw new Error('Global exact-version publication requires --profile workspace');
}
if (args.publish && args.only.length > 0) {
  throw new Error('Global exact-version publication does not allow package-local --only releases');
}
if (args.publish && args.tag !== undefined) {
  throw new Error(
    'Global exact-version publication derives npm dist-tag from the reviewed VERSION'
  );
}
if (args.resumePublished && !args.publish) {
  throw new Error('--resume-published is only valid with --publish');
}
if (args.publish) assertPublishSource();

const releaseVersion = readVersion();
args.tag ??= releaseVersion.isPrerelease ? 'next' : 'latest';

if (!args.publish && !args.dryRun && !args.pack) {
  args.dryRun = true;
}

const packages = getAllPackages();
const launchGovernance =
  args.profile === 'launch' || args.checkGovernance ? loadLaunchPackageGovernance() : null;
const governance = launchGovernance
  ? collectLaunchGovernanceDiagnostics(packages, launchGovernance)
  : null;

if (args.checkGovernance && governance && governance.errors.length > 0) {
  console.error('Launch governance check failed:');
  for (const error of governance.errors) {
    console.error(`- ${error}`);
  }
  if (governance.unclassifiedWorkspacePackages.length > 0) {
    console.error(`  unclassified: ${governance.unclassifiedWorkspacePackages.join(', ')}`);
  }
  if (governance.missingLaunchCommitmentPackages.length > 0) {
    console.error(
      `  missing launch commitment packages: ${governance.missingLaunchCommitmentPackages.join(', ')}`
    );
  }
  if (governance.missingApprovedCandidates.length > 0) {
    console.error(
      `  missing approved candidates: ${governance.missingApprovedCandidates.join(', ')}`
    );
  }
  process.exit(1);
}

const selected = selectPackages(packages, {
  ...args,
  launchGovernance,
});
const ordered = topoSortPackages(selected);
const packageVersions = new Map(
  packages.map((pkg) => [pkg.name, pkg.manifest.version ?? pkg.version])
);

if (ordered.length === 0) {
  console.error('No packages selected.');
  process.exit(1);
}

if (args.publish && ordered.some((pkg) => !pkg.version || pkg.version === '0.0.0')) {
  console.error('Refusing to publish a package with a missing or default 0.0.0 version.');
  process.exit(1);
}

const prerequisiteResults = buildPrerequisitePackages(ordered);
const failedPrerequisites = prerequisiteResults.filter((result) => result.code !== 0);
if (failedPrerequisites.length > 0) {
  console.error('Failed to build prerequisite packages before staging:');
  for (const result of failedPrerequisites) {
    console.error(`- ${result.name}`);
    for (const line of result.diagnostics.slice(0, 8)) {
      console.error(`  ${line}`);
    }
  }
  process.exit(1);
}

mkdirSync(args.outDir, { recursive: true });
ensureCleanDir(args.outDir);

const results = [];
for (const [index, pkg] of ordered.entries()) {
  const result = stagePackage(pkg, {
    ...args,
    packageVersions,
    publishSequenceIndex: index,
  });
  results.push(result);
}

if (args.pack) {
  const manifestPath = join(args.outDir, 'pack-manifest.json');
  const packManifest = {
    schemaVersion: 1,
    releaseVersion: releaseVersion.raw,
    packages: results.map((result) => ({
      name: result.name,
      version: releaseVersion.raw,
      stage: relative(args.outDir, result.stageDir).replaceAll('\\', '/'),
      tarball: relative(args.outDir, result.packResult.path).replaceAll('\\', '/'),
      integrity: result.packResult.integrity,
      shasum: result.packResult.shasum,
    })),
  };
  writeFileSync(manifestPath, `${JSON.stringify(packManifest, null, 2)}\n`);
}

console.log(`Staged ${results.length} packages into ${args.outDir}`);
console.log('');

if (prerequisiteResults.length > 0) {
  console.log('Prerequisite builds:');
  for (const result of prerequisiteResults) {
    console.log(`- ${result.name}: exit code ${result.code}`);
  }
  console.log('');
}

if (governance) {
  console.log(`Governance release line: ${governance.releaseLine}`);
  console.log(`Approved candidates included: ${args.includeApprovedCandidates ? 'yes' : 'no'}`);
  console.log('');
}

for (const result of results) {
  console.log(`- ${result.name}`);
  console.log(`  stage: ${result.stageDir}`);
  console.log(`  build exit code: ${result.buildCode}`);
  if (result.buildErrors.length > 0) {
    console.log(`  build diagnostics: ${result.buildErrors.length}`);
  } else {
    console.log('  build diagnostics: 0');
  }
  if (result.publishResult) {
    if (result.publishResult.resumed) {
      console.log(`  npm publish: recovered existing identical tarball`);
      console.log(`  registry integrity: ${result.publishResult.integrity}`);
    } else {
      console.log(`  npm publish exit code: ${result.publishResult.code}`);
      console.log(
        `  npm publish attempt: ${result.publishResult.attempt}/${result.publishResult.maxAttempts}`
      );
    }
  }
  if (result.packResult) {
    console.log(`  tarball: ${result.packResult.filename}`);
  }
}

const failedBuilds = results.filter((result) => result.buildCode !== 0);
if (failedBuilds.length > 0) {
  console.log('');
  console.log('Packages with TypeScript diagnostics:');
  for (const result of failedBuilds) {
    console.log(`- ${result.name}`);
    for (const line of result.buildErrors.slice(0, 8)) {
      console.log(`  ${line}`);
    }
  }
  process.exit(1);
}

console.log('');
console.log(`Next step from repo root: cd ${ROOT_DIR}`);

function assertPublishSource() {
  const currentBranch =
    process.env.GITHUB_REF_NAME ||
    spawnSync('git', ['branch', '--show-current'], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    }).stdout.trim();
  if (currentBranch !== 'main') {
    throw new Error(
      `Real publication is only allowed from main (got: ${currentBranch || 'detached'})`
    );
  }

  for (const args of [
    ['diff', '--quiet'],
    ['diff', '--cached', '--quiet'],
  ]) {
    const result = spawnSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8' });
    if (result.status !== 0) {
      throw new Error('Real publication requires a clean tracked main worktree');
    }
  }

  const governance = spawnSync(
    process.execPath,
    [join(ROOT_DIR, 'scripts', 'release', 'check-version-governance.mjs')],
    { cwd: ROOT_DIR, encoding: 'utf8' }
  );
  if (governance.status !== 0) {
    throw new Error(
      `Real publication requires valid global release governance\n${governance.stderr || governance.stdout}`
    );
  }
}
