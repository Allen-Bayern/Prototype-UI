import type { CollectionConfigPatch, CollectionHandles } from '@proto.ui/core';

import { asCollection } from '../as-collection';

export function useCollection(options: CollectionConfigPatch): CollectionHandles {
  const collection = asCollection();
  collection.configure(options);
  return collection;
}
