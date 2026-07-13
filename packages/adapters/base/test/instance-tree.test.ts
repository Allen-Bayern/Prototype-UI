import { describe, expect, it } from 'vitest';
import { createInstanceTreeMarkers } from '../src';

describe('adapter-base: logical instance tree', () => {
  it('binds owner-level parent identity before either token has a host view', () => {
    const tree = createInstanceTreeMarkers('@proto.ui/test/logical-instance-tree');
    const parent = tree.createLogicalInstance({ name: 'parent', setup: () => undefined });
    const child = tree.createLogicalInstance({ name: 'child', setup: () => undefined });

    tree.bindLogicalParent(child, parent);

    expect(tree.getLogicalParent(child)).toBe(parent);
    expect(tree.getLogicalRoot(child)).toBeNull();

    tree.bindLogicalParent(child, null);
    expect(tree.getLogicalParent(child)).toBeNull();
  });

  it('clears a host projection without clearing logical ownership', () => {
    const tree = createInstanceTreeMarkers('@proto.ui/test/logical-projection-tree');
    const parent = tree.createLogicalInstance({ name: 'parent', setup: () => undefined });
    const child = tree.createLogicalInstance({ name: 'child', setup: () => undefined });
    const parentRoot = document.createElement('div');
    const childRoot = document.createElement('div');

    tree.markProtoInstance(parentRoot, { name: 'parent', setup: () => undefined }, parent);
    tree.markProtoInstance(childRoot, { name: 'child', setup: () => undefined }, child);
    tree.bindLogicalParent(child, parent);
    tree.setProtoParent(childRoot, parentRoot);

    tree.clearProtoParentProjection(childRoot);

    expect(tree.getProtoParent(childRoot)).toBeNull();
    expect(tree.getLogicalParent(child)).toBe(parent);
  });
});
