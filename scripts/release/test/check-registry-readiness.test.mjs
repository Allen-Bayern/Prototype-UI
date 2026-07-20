import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  checkRegistryReadiness,
  parseRegistryReadinessArgs,
} from '../check-registry-readiness.mjs';

test('registry readiness reports public package identities and encodes scoped names', async () => {
  const requested = [];
  const report = await checkRegistryReadiness(['@proto.ui/core', '@proto.ui/hooks'], {
    registry: 'https://registry.example.test/',
    timeoutMs: 1_000,
    fetchImpl: async (url) => {
      requested.push(url.href);
      return response(200);
    },
  });

  assert.deepEqual(report, {
    ready: ['@proto.ui/core', '@proto.ui/hooks'],
    missing: [],
    errors: [],
  });
  assert.deepEqual(requested, [
    'https://registry.example.test/%40proto.ui%2Fcore',
    'https://registry.example.test/%40proto.ui%2Fhooks',
  ]);
});

test('registry readiness distinguishes missing identities from registry failures', async () => {
  const report = await checkRegistryReadiness(
    ['@proto.ui/ready', '@proto.ui/missing', '@proto.ui/unavailable'],
    {
      timeoutMs: 1_000,
      fetchImpl: async (url) => {
        if (url.href.endsWith('%2Fready')) return response(200);
        if (url.href.endsWith('%2Fmissing')) return response(404);
        return response(503, 'Service Unavailable', 'retry later');
      },
    }
  );

  assert.deepEqual(report.ready, ['@proto.ui/ready']);
  assert.deepEqual(report.missing, ['@proto.ui/missing']);
  assert.deepEqual(report.errors, [
    {
      name: '@proto.ui/unavailable',
      detail: 'HTTP 503 Service Unavailable: retry later',
    },
  ]);
});

test('registry readiness records transport failures without treating packages as missing', async () => {
  const report = await checkRegistryReadiness(['@proto.ui/core'], {
    timeoutMs: 1_000,
    fetchImpl: async () => {
      throw new Error('network unavailable');
    },
  });

  assert.deepEqual(report, {
    ready: [],
    missing: [],
    errors: [{ name: '@proto.ui/core', detail: 'network unavailable' }],
  });
});

test('registry readiness arguments validate timeout and registry values', () => {
  assert.deepEqual(
    parseRegistryReadinessArgs([
      '--registry',
      'https://registry.example.test',
      '--timeout-ms',
      '2500',
    ]),
    { registry: 'https://registry.example.test', timeoutMs: 2_500 }
  );
  assert.throws(() => parseRegistryReadinessArgs(['--timeout-ms', '0']), /positive integer/);
  assert.throws(() => parseRegistryReadinessArgs(['--unknown']), /Unknown argument/);
});

function response(status, statusText = '', body = '') {
  return {
    status,
    statusText,
    text: async () => body,
  };
}
