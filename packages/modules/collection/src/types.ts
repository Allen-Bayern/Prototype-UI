import type {
  CollectionItemMeta,
  CollectionItemSnapshot,
  CollectionItemSnapshotExposed,
  ModuleInstance,
  Unsubscribe,
} from '@proto.ui/core';
import type { PropsBaseType } from '@proto.ui/types';

export type CollectionProviderConfig = Readonly<{
  family: unknown;
  itemRole: string;
  itemMetaExposeKey: string;
}>;

export type CollectionItemConfig = Readonly<{
  family: unknown;
  role: string;
}>;

export type CollectionItemPosition = Readonly<{
  index: number;
  total: number;
  first: boolean;
  last: boolean;
}>;

export type CollectionFacade = {
  getCollection<P extends PropsBaseType = PropsBaseType>(): CollectionHandleForModule<P>;
  getCollectionItem<P extends PropsBaseType = PropsBaseType>(): CollectionItemHandleForModule<P>;
};

export type CollectionHandleForModule<P extends PropsBaseType = PropsBaseType> = {
  configure(config: CollectionProviderConfig): void;
  readItems(): readonly CollectionItemSnapshot[];
  readCount(): number;
  subscribe(cb: () => void): Unsubscribe;
};

export type CollectionItemHandleForModule<P extends PropsBaseType = PropsBaseType> = {
  configure(config: CollectionItemConfig): void;
  readPosition(): CollectionItemPosition;
  buildSnapshot(meta: CollectionItemMeta): CollectionItemSnapshotExposed;
  subscribe(cb: () => void): Unsubscribe;
};

export type CollectionPort = {
  configureProvider(config: CollectionProviderConfig): void;
  configureItem(config: CollectionItemConfig): void;
  readProviderItems(): readonly CollectionItemSnapshot[];
  readProviderCount(): number;
  readItemPosition(): CollectionItemPosition;
  buildItemSnapshot(meta: CollectionItemMeta): CollectionItemSnapshotExposed;
  subscribeProvider(cb: () => void): Unsubscribe;
  subscribeItem(cb: () => void): Unsubscribe;
};

export type CollectionModule = ModuleInstance<CollectionFacade> & {
  name: 'collection';
  scope: 'instance';
  port: CollectionPort;
};
