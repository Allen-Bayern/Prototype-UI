import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { loadSpecWorkspaceFromDirectory } from '@proto.ui/spec-engine/node';
import { describe, expect, it } from 'vitest';

describe('spec workspace relations', () => {
  it('validates criterion-level dependency target types', async () => {
    const specDir = await mkdtemp(path.join(os.tmpdir(), 'proto-ui-spec-relations-'));

    try {
      await writeFile(
        path.join(specDir, 'D-VALID-0001.yaml'),
        [
          'id: D-VALID-0001',
          'type: decision',
          'title: Valid decision',
          'status: active',
          'since: 0.1.0',
          'criteria: []',
          '',
        ].join('\n')
      );
      await writeFile(
        path.join(specDir, 'P-VALID.yaml'),
        [
          'id: P-VALID',
          'type: prototype',
          'title: Valid prototype',
          'status: draft',
          'since: 0.1.0',
          'criteria:',
          '  - id: P-VALID-CRITERION',
          '    text: Criterion with wrong relation type.',
          '    dependsOn:',
          '      contracts:',
          '        - D-VALID-0001',
          '',
        ].join('\n')
      );

      const workspace = await loadSpecWorkspaceFromDirectory(specDir);

      expect(workspace.issues).toEqual([
        {
          filePath: path.join(specDir, 'P-VALID.yaml'),
          message:
            'P-VALID-CRITERION dependsOn.contracts target D-VALID-0001 is decision, expected contract.',
        },
      ]);
    } finally {
      await rm(specDir, { recursive: true, force: true });
    }
  });
});
