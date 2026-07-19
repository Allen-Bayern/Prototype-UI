#!/usr/bin/env node
import { readVersion, findProtoPackages } from './version-utils.mjs';

const version = readVersion();
const packages = findProtoPackages();

const violations = [];
for (const pkg of packages) {
  const v = pkg.manifest.version || '';
  if (v !== version.raw) {
    violations.push({ name: pkg.manifest.name, version: v });
  }
}

if (violations.length > 0) {
  console.error(
    `check-lockstep: ${violations.length} public @proto.ui package(s) do not match ${version.raw}:`
  );
  for (const violation of violations) {
    console.error(`  ${violation.name} @ ${violation.version || '<missing>'}`);
  }
  console.error(`expected exact version: ${version.raw}`);
  process.exit(1);
}

console.log(
  `check-lockstep: all ${packages.length} public @proto.ui packages exactly on ${version.raw}`
);
