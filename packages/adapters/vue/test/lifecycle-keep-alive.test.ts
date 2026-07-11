import { describe, expect, it } from 'vitest';
import { definePrototype } from '@proto.ui/core';
import { createVueAdapter } from '../src/adapt';
import { flushVue, VueAny } from './utils/vue';

describe('adapter-vue: KeepAlive lifecycle boundary', () => {
  it('maps deactivation/reactivation to view epochs without recreating the Proto instance', async () => {
    const calls = { setup: 0, created: 0, mounted: 0, unmounted: 0, disposed: 0 };
    const proto = definePrototype({
      name: 'vue-keep-alive-view-epochs',
      setup(def) {
        calls.setup += 1;
        def.lifecycle.onCreated(() => (calls.created += 1));
        def.lifecycle.onMounted(() => (calls.mounted += 1));
        def.lifecycle.onUnmounted(() => (calls.unmounted += 1));
        def.lifecycle.onBeforeDispose(() => (calls.disposed += 1));
        return (run) => run.el('div', 'ok');
      },
    });
    const Component = createVueAdapter(VueAny)(proto);
    const active = VueAny.ref(true);
    const host = document.createElement('div');
    document.body.appendChild(host);
    const app = VueAny.createApp({
      setup() {
        return () =>
          VueAny.h(VueAny.KeepAlive, null, () =>
            active.value ? VueAny.h(Component, { key: 'proto' }) : null
          );
      },
    });

    app.mount(host);
    await flushVue();
    expect(calls).toEqual({ setup: 1, created: 1, mounted: 1, unmounted: 0, disposed: 0 });

    active.value = false;
    await flushVue();
    expect(calls).toEqual({ setup: 1, created: 1, mounted: 1, unmounted: 1, disposed: 0 });

    active.value = true;
    await flushVue();
    await flushVue();
    expect(calls).toEqual({ setup: 1, created: 1, mounted: 2, unmounted: 1, disposed: 0 });

    app.unmount();
    await flushVue();
    expect(calls.disposed).toBe(1);
    host.remove();
  });
});
