import { describe, expect, it } from 'vitest';
import { createContextKey } from '../../src';

describe('contract: core / context key (v0)', () => {
  it('T-CONTEXT-0001-CASE-KEY-IDENTITY: creates reference-identity context keys', () => {
    const first = createContextKey<{ value: number }>('ctx');
    const second = createContextKey<{ value: number }>('ctx');

    expect(first).not.toBe(second);
    expect(first.debugName).toBe('ctx');
    expect(second.debugName).toBe('ctx');
    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
  });
});
