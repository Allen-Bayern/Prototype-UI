import { isExposeStateExternalHandle } from '@proto.ui/module-expose-state';

export type CallbackScopeInvoker = (fn: () => void) => void;

export interface ScopedExposesReader {
  read(record: Record<string, unknown>): Record<string, unknown>;
}

/**
 * Keeps an adapter expose snapshot stable while ensuring every outward method
 * enters the owning Proto instance's callback scope before it runs.
 */
export function createScopedExposesReader(
  getInvoker: () => CallbackScopeInvoker | null | undefined
): ScopedExposesReader {
  let lastRaw: Record<string, unknown> | null = null;
  let lastWrapped: Record<string, unknown> = {};
  const externalHandleCache = new WeakMap<object, Record<string, unknown>>();

  const wrapRecord = (record: Record<string, unknown>): Record<string, unknown> => {
    const wrapped: Record<string, unknown> = {};

    const defineEntry = (key: string, value: unknown) => {
      Object.defineProperty(wrapped, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    };

    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'function') {
        defineEntry(key, (...args: unknown[]) => {
          let result: unknown;
          const invoke = getInvoker();
          const call = () => {
            result = (value as (...methodArgs: unknown[]) => unknown)(...args);
          };

          if (invoke) invoke(call);
          else call();

          return result;
        });
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        if (isExposeStateExternalHandle(value)) {
          let projected = externalHandleCache.get(value);
          if (!projected) {
            projected = wrapRecord(value as unknown as Record<string, unknown>);
            externalHandleCache.set(value, projected);
          }
          defineEntry(key, projected);
        } else {
          defineEntry(key, wrapRecord(value as Record<string, unknown>));
        }
      } else {
        defineEntry(key, value);
      }
    }

    return wrapped;
  };

  return {
    read(record) {
      if (record !== lastRaw) {
        lastRaw = record;
        lastWrapped = wrapRecord(record);
      }
      return { ...lastWrapped };
    },
  };
}
