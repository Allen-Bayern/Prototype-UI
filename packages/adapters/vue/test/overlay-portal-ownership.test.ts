import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';

import { createVueOverlayGlobalMount } from '../src/runtime/modules';
import {
  bindLogicalParent,
  createLogicalInstance,
  getProtoParent,
  markProtoInstance,
} from '../src/platform/instance-tree';

describe('adapter-vue: overlay portal ownership', () => {
  it('never reparents a Vue-owned host node imperatively', () => {
    const parentProto = definePrototype({
      name: 'vue-overlay-owner-parent',
      setup: () => (r) => r.el('div'),
    });
    const childProto = definePrototype({
      name: 'vue-overlay-owner-child',
      setup: () => (r) => r.el('div'),
    });
    const parentToken = createLogicalInstance(parentProto as any);
    const childToken = createLogicalInstance(childProto as any);
    bindLogicalParent(childToken, parentToken);

    const parentRoot = document.createElement('div');
    const vueContainer = document.createElement('div');
    const childRoot = document.createElement('div');
    vueContainer.appendChild(childRoot);
    document.body.append(parentRoot, vueContainer);
    markProtoInstance(parentRoot, parentProto as any, parentToken);
    markProtoInstance(childRoot, childProto as any, childToken);

    const globalMount = createVueOverlayGlobalMount(childToken);

    try {
      globalMount.mount(childRoot);

      expect(childRoot.parentNode).toBe(vueContainer);
      expect(getProtoParent(childRoot)).toBe(parentRoot);

      globalMount.unmount(childRoot);

      expect(childRoot.parentNode).toBe(vueContainer);
    } finally {
      parentRoot.remove();
      vueContainer.remove();
    }
  });
});
