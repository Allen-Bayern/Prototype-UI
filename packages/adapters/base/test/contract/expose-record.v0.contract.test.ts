import { describe, expect, it, vi } from 'vitest';

import { createScopedExposesReader } from '../../src/host/exposes';

describe('adapter-base contract: expose record (v0)', () => {
  it('preserves arbitrary keys and invokes nested methods in callback scope', () => {
    const invoke = vi.fn((call: () => void) => call());
    const reader = createScopedExposesReader(() => invoke);
    const protoValue = { run: () => 'ok' };
    const record: Record<string, unknown> = {};
    Object.defineProperty(record, '__proto__', {
      value: protoValue,
      enumerable: true,
      configurable: true,
      writable: true,
    });

    const snapshot = reader.read(record);

    expect(Object.getPrototypeOf(snapshot)).toBe(Object.prototype);
    expect(Object.hasOwn(snapshot, '__proto__')).toBe(true);
    expect((snapshot.__proto__ as { run(): string }).run()).toBe('ok');
    expect(invoke).toHaveBeenCalledOnce();
  });
});
