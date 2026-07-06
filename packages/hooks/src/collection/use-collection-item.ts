import type { CollectionItemConfigPatch, CollectionItemHandles } from '@proto.ui/core';

import { asCollectionItem } from '../as-collection-item';

export function useCollectionItem(options: CollectionItemConfigPatch): CollectionItemHandles {
  const item = asCollectionItem();
  item.configure(options);
  return item;
}
