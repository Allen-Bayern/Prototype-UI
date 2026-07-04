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

  it('validates criterion-level reference target types', async () => {
    const specDir = await mkdtemp(path.join(os.tmpdir(), 'proto-ui-spec-references-'));

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
          '    text: Criterion with wrong reference type.',
          '    references:',
          '      prototypes:',
          '        - D-VALID-0001',
          '',
        ].join('\n')
      );

      const workspace = await loadSpecWorkspaceFromDirectory(specDir);

      expect(workspace.issues).toEqual([
        {
          filePath: path.join(specDir, 'P-VALID.yaml'),
          message:
            'P-VALID-CRITERION references.prototypes target D-VALID-0001 is decision, expected prototype.',
        },
      ]);
    } finally {
      await rm(specDir, { recursive: true, force: true });
    }
  });

  it('validates criterion-level relation anchors against target criteria', async () => {
    const specDir = await mkdtemp(path.join(os.tmpdir(), 'proto-ui-spec-anchor-relations-'));

    try {
      await writeFile(
        path.join(specDir, 'P-TARGET.yaml'),
        [
          'id: P-TARGET',
          'type: prototype',
          'title: Target prototype',
          'status: draft',
          'since: 0.1.0',
          'criteria:',
          '  - id: P-TARGET-KNOWN',
          '    text: Known target criterion.',
          '',
        ].join('\n')
      );
      await writeFile(
        path.join(specDir, 'P-SOURCE.yaml'),
        [
          'id: P-SOURCE',
          'type: prototype',
          'title: Source prototype',
          'status: draft',
          'since: 0.1.0',
          'criteria:',
          '  - id: P-SOURCE-CRITERION',
          '    text: Criterion with one valid and one invalid reference anchor.',
          '    references:',
          '      prototypes:',
          '        - id: P-TARGET',
          '          anchors:',
          '            - P-TARGET-KNOWN',
          '            - P-TARGET-MISSING',
          '',
        ].join('\n')
      );

      const workspace = await loadSpecWorkspaceFromDirectory(specDir);

      expect(workspace.issues).toEqual([
        {
          filePath: path.join(specDir, 'P-SOURCE.yaml'),
          message:
            'P-SOURCE-CRITERION references.prototypes relation to P-TARGET anchors unknown criterion P-TARGET-MISSING.',
        },
      ]);
    } finally {
      await rm(specDir, { recursive: true, force: true });
    }
  });
});
