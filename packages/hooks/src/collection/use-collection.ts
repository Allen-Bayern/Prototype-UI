import { defineHook } from '@proto.ui/core';
import type {
  AnatomyFamily,
  CollectionExposes,
  CollectionHandles,
  CollectionItemSnapshot,
  CollectionOptions,
  RunHandle,
} from '@proto.ui/core';
import type { AnatomyPort } from '@proto.ui/module-anatomy';
import { getActiveAsHookContext } from '@proto.ui/core/internal';

const DEFAULT_ITEM_ROLE = 'item';
const DEFAULT_ITEM_META_EXPOSE_KEY = '__collectionItem';

function readItemSnapshot(part: { getExpose(key: string): unknown | null }, exposeKey: string) {
  const value = part.getExpose(exposeKey);
  if (!value) return {};
  if (typeof value === 'function') {
    const next = value();
    return next && typeof next === 'object' ? next : {};
  }
  return typeof value === 'object' ? value : {};
}

function buildCollectionItems(
  parts: readonly { getExpose(key: string): unknown | null }[],
  itemMetaExposeKey: string
): readonly CollectionItemSnapshot[] {
  const total = parts.length;
  return parts.map((part, index) => ({
    ...readItemSnapshot(part, itemMetaExposeKey),
    index,
    total,
    first: index === 0,
    last: index === total - 1,
  }));
}

function buildCollectionItemsFromPort(
  anatomy: AnatomyPort,
  family: AnatomyFamily,
  itemRole: string,
  itemMetaExposeKey: string
): readonly CollectionItemSnapshot[] {
  return buildCollectionItems(
    anatomy.order.partsOf(family, itemRole, { missing: 'empty' }),
    itemMetaExposeKey
  );
}

function getAnatomyPort(): AnatomyPort {
  const { ports } = getActiveAsHookContext('useCollection');
  const anatomy = ports.anatomy as AnatomyPort | undefined;
  if (!anatomy?.order) {
    throw new Error('[Hook:useCollection] anatomy port unavailable.');
  }
  return anatomy;
}

export const useCollection = defineHook<
  any,
  CollectionExposes,
  CollectionHandles,
  CollectionOptions
>({
  name: 'useCollection',
  mode: 'once',
  setup(def, options, api) {
    const itemRole = options.itemRole ?? DEFAULT_ITEM_ROLE;
    const rootRole = options.rootRole ?? false;
    const itemMetaExposeKey = options.itemMetaExposeKey ?? DEFAULT_ITEM_META_EXPOSE_KEY;
    const countStateKey = options.countStateKey ?? 'collectionCount';
    const exposeCountStateKey = options.exposeCountStateKey ?? 'count';
    const exposeItemsMethodKey = options.exposeItemsMethodKey ?? 'getCollectionItems';
    const exposeCountMethodKey = options.exposeCountMethodKey ?? 'getCollectionCount';
    const anatomy = getAnatomyPort();

    if (rootRole) {
      def.anatomy.claim(options.family, { role: rootRole });
    }

    const count = def.state.numberDiscrete(countStateKey, 0);
    api.store.items = [] as readonly CollectionItemSnapshot[];
    api.store.version = -1;

    const sync = (run: RunHandle<any>) => {
      const version = anatomy.order.version(options.family, { missing: 'null' });
      if (version == null) return;
      if (api.store.version === version) return;
      const items = buildCollectionItemsFromPort(
        anatomy,
        options.family,
        itemRole,
        itemMetaExposeKey
      );
      api.store.items = items;
      api.store.version = version;
      count.set(items.length, 'reason: useCollection.sync => collection count');
    };

    def.expose.state(exposeCountStateKey as keyof CollectionExposes & string, count);
    def.expose.method(exposeItemsMethodKey as keyof CollectionExposes & string, () => {
      return buildCollectionItems(
        anatomy.order.partsOf(options.family, itemRole, { missing: 'empty' }),
        itemMetaExposeKey
      );
    });
    def.expose.method(exposeCountMethodKey as keyof CollectionExposes & string, () => {
      return anatomy.order.partsOf(options.family, itemRole, { missing: 'empty' }).length;
    });

    def.lifecycle.onMounted((run) => {
      sync(run);
      api.store.offOrder = anatomy.subscribeOrder(options.family, (ctx) => {
        sync(ctx as RunHandle<any>);
      });
    });
    def.lifecycle.onUpdated((run) => {
      sync(run);
    });
    def.lifecycle.onUnmounted(() => {
      (api.store.offOrder as (() => void) | undefined)?.();
      api.store.offOrder = undefined;
    });
  },
});
