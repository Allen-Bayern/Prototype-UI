import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { fileExists, readJsonFile } from '../utils/fs.js';

export type PackageManager = 'npm' | 'pnpm' | 'yarn';

const cliManifest = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
) as { version?: unknown };

const cliReleaseVersion = cliManifest.version;

if (typeof cliReleaseVersion !== 'string' || cliReleaseVersion.length === 0) {
  throw new Error('@proto.ui/cli package.json must declare a release version');
}

export const CLI_RELEASE_VERSION = cliReleaseVersion;

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  if (await fileExists(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await fileExists(path.join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

export function formatInstallCommand(
  pm: PackageManager,
  packages: string[],
  { dev = false, exact = false }: { dev?: boolean; exact?: boolean } = {}
): string {
  const list = packages.join(' ');
  const exactFlag = exact ? (pm === 'yarn' ? ' --exact' : ' --save-exact') : '';
  if (pm === 'pnpm')
    return dev ? `pnpm add -D${exactFlag} ${list}` : `pnpm add${exactFlag} ${list}`;
  if (pm === 'yarn')
    return dev ? `yarn add -D${exactFlag} ${list}` : `yarn add${exactFlag} ${list}`;
  return dev
    ? `npm install --save-dev${exactFlag} ${list}`
    : `npm install --save${exactFlag} ${list}`;
}

export function toExactProtoUiInstallSpec(
  packageName: string,
  version = CLI_RELEASE_VERSION
): string {
  return packageName.startsWith('@proto.ui/') ? `${packageName}@${version}` : packageName;
}

export function installPackages(
  pm: PackageManager,
  cwd: string,
  packages: string[],
  { dev = false, exact = false }: { dev?: boolean; exact?: boolean } = {}
): void {
  if (packages.length === 0) return;

  let cmd = 'npm';
  let args: string[];
  if (pm === 'pnpm') {
    cmd = 'pnpm';
    args = ['add', ...(dev ? ['-D'] : []), ...(exact ? ['--save-exact'] : []), ...packages];
  } else if (pm === 'yarn') {
    cmd = 'yarn';
    args = ['add', ...(dev ? ['-D'] : []), ...(exact ? ['--exact'] : []), ...packages];
  } else {
    args = [
      'install',
      dev ? '--save-dev' : '--save',
      ...(exact ? ['--save-exact'] : []),
      ...packages,
    ];
  }

  // Windows: spawnSync needs shell:true to resolve npm/yarn/pnpm via .cmd shims.
  // Node 18.20+ blocks .cmd/.bat under shell:false (CVE-2024-27980 mitigation).
  const isWindows = process.platform === 'win32';
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: isWindows,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} exited with code ${result.status ?? 'unknown'}`);
  }
}

export async function readProjectPackageJson(cwd: string): Promise<Record<string, unknown> | null> {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!(await fileExists(packageJsonPath))) return null;
  return readJsonFile(packageJsonPath) as Promise<Record<string, unknown>>;
}

export function hasPackage(
  projectPkg: Record<string, unknown> | null,
  packageName: string
): boolean {
  if (!projectPkg) return false;
  const deps = projectPkg.dependencies as Record<string, unknown> | undefined;
  const devDeps = projectPkg.devDependencies as Record<string, unknown> | undefined;
  const peerDeps = projectPkg.peerDependencies as Record<string, unknown> | undefined;
  const optDeps = projectPkg.optionalDependencies as Record<string, unknown> | undefined;
  return Boolean(
    deps?.[packageName] ||
    devDeps?.[packageName] ||
    peerDeps?.[packageName] ||
    optDeps?.[packageName]
  );
}
