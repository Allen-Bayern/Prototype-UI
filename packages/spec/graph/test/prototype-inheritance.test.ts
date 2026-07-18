import { buildSpecGraph } from '@proto.ui/spec-graph';
import { validateSpecEntity } from '@proto.ui/spec-schema';
import { describe, expect, it } from 'vitest';

describe('prototype inheritance graph projection', () => {
  it('projects inheritance as a distinct graph edge', () => {
    const base = validateSpecEntity({
      id: 'P-GRAPH-BASE',
      type: 'prototype',
      title: 'Graph base prototype',
      status: 'draft',
      since: '0.2.0',
      criteria: [],
    });
    const derived = validateSpecEntity({
      id: 'P-GRAPH-DERIVED',
      type: 'prototype',
      title: 'Graph derived prototype',
      status: 'draft',
      since: '0.2.0',
      criteria: [],
      inherits: { prototypes: ['P-GRAPH-BASE'] },
    });

    const graph = buildSpecGraph({
      version: '0.2.0',
      generatedAt: '2026-07-18T00:00:00.000Z',
      entities: [base, derived],
    });

    expect(graph.edges).toContainEqual({
      id: 'P-GRAPH-DERIVED:inherits:prototypes:P-GRAPH-BASE',
      from: 'P-GRAPH-DERIVED',
      to: 'P-GRAPH-BASE',
      kind: 'inherits',
      relation: 'prototypes',
      anchors: [],
      role: undefined,
      coverageImpact: undefined,
    });
  });
});
