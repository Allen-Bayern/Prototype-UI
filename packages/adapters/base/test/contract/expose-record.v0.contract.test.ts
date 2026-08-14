import { describe, expect, it, vi } from 'vitest';
import { EXPOSE_STATE_EXTERNAL_HANDLE } from '@proto.ui/module-expose-state';

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

  it('preserves a finalized external state handle across record replacement', () => {
    const reader = createScopedExposesReader((() => (call: () => void) => call()) as any);
    const handle = {
      [EXPOSE_STATE_EXTERNAL_HANDLE]: true,
      get: () => false,
      subscribe: () => () => {},
      unsubscribe: (off: () => void) => off(),
      spec: { kind: 'bool' },
    } as const;

    const first = reader.read({ ready: handle }).ready;
    const second = reader.read({ ready: handle }).ready;

    expect(second).toBe(first);
  });
});
