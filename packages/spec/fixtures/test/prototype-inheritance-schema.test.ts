import { validateSpecEntity } from '@proto.ui/spec-schema';
import { describe, expect, it } from 'vitest';

const baseEntity = {
  title: 'Inheritance fixture',
  status: 'draft' as const,
  since: '0.2.0',
  criteria: [],
};

describe('prototype inheritance schema', () => {
  it('accepts a prototype-to-prototype inheritance relation', () => {
    const entity = validateSpecEntity({
      ...baseEntity,
      id: 'P-INHERITANCE-SOURCE',
      type: 'prototype',
      inherits: {
        prototypes: [
          {
            id: 'P-INHERITANCE-TARGET',
            note: 'Inherited by default; explicit criteria may apply setup-time negative patches.',
          },
        ],
      },
    });

    expect(entity.inherits?.prototypes).toEqual([
      {
        id: 'P-INHERITANCE-TARGET',
        note: 'Inherited by default; explicit criteria may apply setup-time negative patches.',
      },
    ]);
  });

  it('rejects inheritance on a non-prototype entity', () => {
    expect(() =>
      validateSpecEntity({
        ...baseEntity,
        id: 'D-INHERITANCE-0001',
        type: 'decision',
        inherits: { prototypes: ['P-INHERITANCE-TARGET'] },
      })
    ).toThrow('Only prototype entities may declare prototype inheritance.');
  });

  it('rejects non-prototype inheritance targets structurally', () => {
    expect(() =>
      validateSpecEntity({
        ...baseEntity,
        id: 'P-INHERITANCE-SOURCE',
        type: 'prototype',
        inherits: { contracts: ['C-INHERITANCE-0001'] },
      })
    ).toThrow();
  });
});
