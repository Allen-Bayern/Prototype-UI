import type { ContextKey, JsonObject } from '@proto.ui/types';

export function createContextKey<T extends JsonObject>(debugName: string): ContextKey<T> {
  return Object.freeze({
    __brand: 'ContextKey',
    debugName,
  }) as ContextKey<T>;
}
