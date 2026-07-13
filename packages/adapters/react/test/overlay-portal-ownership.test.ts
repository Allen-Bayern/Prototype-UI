import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';

import { createReactOverlayGlobalMount } from '../src/runtime/modules';
import {
  bindLogicalParent,
  createLogicalInstance,
  getProtoParent,
  markProtoInstance,
} from '../src/platform/instance-tree';

describe('adapter-react: overlay portal ownership', () => {
  it('never reparents a React-owned host node imperatively', () => {
    const parentProto = definePrototype({
      name: 'react-overlay-owner-parent',
      setup: () => (r) => r.el('div'),
    });
    const childProto = definePrototype({
      name: 'react-overlay-owner-child',
      setup: () => (r) => r.el('div'),
    });
    const parentToken = createLogicalInstance(parentProto as any);
    const childToken = createLogicalInstance(childProto as any);
    bindLogicalParent(childToken, parentToken);

    const parentRoot = document.createElement('div');
    const reactContainer = document.createElement('div');
    const childRoot = document.createElement('div');
    reactContainer.appendChild(childRoot);
    document.body.append(parentRoot, reactContainer);
    markProtoInstance(parentRoot, parentProto as any, parentToken);
    markProtoInstance(childRoot, childProto as any, childToken);

    const globalMount = createReactOverlayGlobalMount(childToken);

    try {
      globalMount.mount(childRoot);

      expect(childRoot.parentNode).toBe(reactContainer);
      expect(getProtoParent(childRoot)).toBe(parentRoot);

      globalMount.unmount(childRoot);

      expect(childRoot.parentNode).toBe(reactContainer);
    } finally {
      parentRoot.remove();
      reactContainer.remove();
    }
  });
});
