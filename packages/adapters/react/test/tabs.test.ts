import { describe, expect, it } from 'vitest';
import { tabsContent, tabsList, tabsRoot, tabsTrigger } from '../../../prototypes/base/src/tabs';

import { createMountedReactAdapter, createMountedReactAdapterInto } from './utils/fake-react';

function appendHost(parent: HTMLElement): HTMLElement {
  const host = document.createElement('span');
  parent.appendChild(host);
  return host;
}

describe('adapter-react: base tabs compound protocol', () => {
  it('coordinates tabs context, anatomy, a11y label, and trigger activation', () => {
    const root = createMountedReactAdapter(tabsRoot, { defaultValue: 'a' });
    const rootEl = root.root as HTMLElement;
    const list = createMountedReactAdapterInto(tabsList, appendHost(rootEl), {
      a11yLabel: 'React tabs',
    });
    const triggerA = createMountedReactAdapterInto(tabsTrigger, appendHost(list.root!), {
      value: 'a',
    });
    const triggerB = createMountedReactAdapterInto(tabsTrigger, appendHost(list.root!), {
      value: 'b',
    });
    const contentA = createMountedReactAdapterInto(tabsContent, appendHost(rootEl), {
      value: 'a',
    });
    const contentB = createMountedReactAdapterInto(tabsContent, appendHost(rootEl), {
      value: 'b',
    });

    expect(list.root?.getAttribute('role')).toBe('tablist');
    expect(list.root?.getAttribute('aria-label')).toBe('React tabs');
    expect(root.ref.current?.getExposes().value.get()).toBe('a');
    expect(triggerA.ref.current?.getExposes().selected.get()).toBe(true);
    expect(contentA.ref.current?.getExposes().current.get()).toBe(true);

    triggerB.root?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(root.ref.current?.getExposes().value.get()).toBe('b');
    expect(triggerA.ref.current?.getExposes().selected.get()).toBe(false);
    expect(triggerB.ref.current?.getExposes().selected.get()).toBe(true);
    expect(contentA.ref.current?.getExposes().current.get()).toBe(false);
    expect(contentB.ref.current?.getExposes().current.get()).toBe(true);

    contentB.unmount();
    contentA.unmount();
    triggerB.unmount();
    triggerA.unmount();
    list.unmount();
    root.unmount();
  });

  it('lazyMount defers an inactive content view while preserving its logical instance', async () => {
    const root = createMountedReactAdapter(tabsRoot, { defaultValue: 'a' });
    const rootEl = root.root as HTMLElement;
    const triggerA = createMountedReactAdapterInto(tabsTrigger, appendHost(rootEl), { value: 'a' });
    const triggerB = createMountedReactAdapterInto(tabsTrigger, appendHost(rootEl), { value: 'b' });
    const contentHost = appendHost(rootEl);
    const contentB = createMountedReactAdapterInto(tabsContent, contentHost, {
      value: 'b',
      lazyMount: true,
      unmountOnExit: true,
    });
    const keptHost = appendHost(rootEl);
    const keptContent = createMountedReactAdapterInto(tabsContent, keptHost, {
      value: 'never-selected',
      lazyMount: true,
      unmountOnExit: true,
      keepMounted: true,
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(contentHost.firstElementChild).toBeNull();
    expect(keptHost.firstElementChild).not.toBeNull();
    expect(contentB.ref.current.getExposes().current.get()).toBe(false);

    triggerB.root?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    contentB.ref.current.update();
    await Promise.resolve();

    expect(contentHost.firstElementChild).not.toBeNull();
    expect(contentB.ref.current.getExposes().current.get()).toBe(true);

    triggerA.root?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    contentB.ref.current.update();
    await Promise.resolve();
    expect(contentHost.firstElementChild).toBeNull();
    expect(contentB.ref.current.getExposes().current.get()).toBe(false);

    triggerB.root?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    contentB.ref.current.update();
    await Promise.resolve();
    expect(contentHost.firstElementChild).not.toBeNull();

    keptContent.unmount();
    contentB.unmount();
    triggerB.unmount();
    triggerA.unmount();
    root.unmount();
  });
});
