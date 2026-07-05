import { validateSpecEntity } from '@proto.ui/spec-schema';
import { describe, expect, it } from 'vitest';

const baseEntity = {
  id: 'P-VALID',
  type: 'prototype',
  title: 'Valid prototype',
  status: 'draft',
  since: '0.1.0',
};

describe('spec anatomy schema', () => {
  it('accepts a structured anatomy family with repeatable indicator roles', () => {
    const entity = validateSpecEntity({
      ...baseEntity,
      anatomy: {
        family: 'base-valid',
        roles: {
          root: {
            cardinality: {
              min: 1,
              max: 1,
            },
          },
          indicator: {
            cardinality: {
              min: 0,
              max: '*',
            },
          },
        },
        relations: [
          {
            kind: 'contains',
            parent: 'root',
            child: 'indicator',
          },
        ],
      },
    });

    expect(entity.anatomy?.roles.indicator.cardinality).toEqual({
      min: 0,
      max: '*',
    });
  });

  it('requires an anatomy family root role', () => {
    expect(() =>
      validateSpecEntity({
        ...baseEntity,
        anatomy: {
          family: 'base-invalid',
          roles: {
            indicator: {
              cardinality: {
                min: 0,
                max: '*',
              },
            },
          },
        },
      })
    ).toThrow('Anatomy family must declare a root role.');
  });

  it('validates anatomy cardinality bounds', () => {
    expect(() =>
      validateSpecEntity({
        ...baseEntity,
        anatomy: {
          family: 'base-invalid',
          roles: {
            root: {
              cardinality: {
                min: 2,
                max: 1,
              },
            },
          },
        },
      })
    ).toThrow('Anatomy cardinality max 1 must be greater than or equal to min 2.');
  });

  it('validates anatomy relation roles', () => {
    expect(() =>
      validateSpecEntity({
        ...baseEntity,
        anatomy: {
          family: 'base-invalid',
          roles: {
            root: {
              cardinality: {
                min: 1,
                max: 1,
              },
            },
          },
          relations: [
            {
              kind: 'contains',
              parent: 'root',
              child: 'missing',
            },
          ],
        },
      })
    ).toThrow('Anatomy relation child role does not exist: missing.');
  });
});
