import { describe, expect, it } from 'vitest';
import { createAnatomyFamily } from '../../src';

describe('contract: core / anatomy family (v0)', () => {
  it('creates static reference-identity family tokens with a required root role', () => {
    const first = createAnatomyFamily('menu', {
      roles: {
        root: { cardinality: { min: 1, max: 1 } },
        item: { cardinality: { min: 0, max: 10 } },
      },
    });
    const second = createAnatomyFamily('menu', {
      roles: {
        root: { cardinality: { min: 1, max: 1 } },
        item: { cardinality: { min: 0, max: 10 } },
      },
    });

    expect(first).not.toBe(second);
    expect(first.debugName).toBe('menu');
    expect(first.decl.roles.root.cardinality).toEqual({ min: 1, max: 1 });
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.decl)).toBe(true);
  });

  it('allows unbounded role cardinality with star max', () => {
    const family = createAnatomyFamily('indicator-family', {
      roles: {
        root: { cardinality: { min: 1, max: 1 } },
        indicator: { cardinality: { min: 0, max: '*' } },
      },
    });

    expect(family.decl.roles.indicator.cardinality).toEqual({ min: 0, max: '*' });
  });

  it('rejects family declarations without a root role', () => {
    expect(() =>
      createAnatomyFamily('missing-root', {
        roles: {
          item: { cardinality: { min: 0, max: 10 } },
        },
      })
    ).toThrow(/root role/i);
  });
});
