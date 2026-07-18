import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  selectContent,
  selectItem,
  selectRoot,
  selectTrigger,
  selectValue,
} from '../../../prototypes/base/src/select';
import { createMountedReactAdapter, createMountedReactAdapterInto } from './utils/fake-react';

function appendHost(parent: HTMLElement): HTMLElement {
  const host = document.createElement('span');
  parent.appendChild(host);
  return host;
}

async function settle(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => vi.useRealTimers());

describe('adapter-react: base select compound protocol', () => {
  it('projects select-only ARIA and keyboard selection through React', async () => {
    vi.useFakeTimers();
    const root = createMountedReactAdapter(selectRoot, {
      defaultOpen: true,
      defaultValue: 'alpha',
    });
    const rootEl = root.root as HTMLElement;
    const trigger = createMountedReactAdapterInto(selectTrigger, appendHost(rootEl));
    const value = createMountedReactAdapterInto(selectValue, appendHost(trigger.root!), {
      placeholder: 'Pick one',
    });
    const content = createMountedReactAdapterInto(selectContent, appendHost(rootEl));
    const alpha = createMountedReactAdapterInto(selectItem, appendHost(content.root!), {
      value: 'alpha',
      textValue: 'Alpha',
    });
    const beta = createMountedReactAdapterInto(selectItem, appendHost(content.root!), {
      value: 'beta',
      textValue: 'Beta',
    });
    await settle();

    try {
      expect(trigger.root?.getAttribute('role')).toBe('combobox');
      expect(trigger.root?.getAttribute('aria-haspopup')).toBe('listbox');
      expect(trigger.root?.getAttribute('aria-expanded')).toBe('true');
      expect(content.root?.getAttribute('role')).toBe('listbox');
      expect(content.root?.getAttribute('id')).toBe(trigger.root?.getAttribute('aria-controls'));
      expect(alpha.root?.getAttribute('role')).toBe('option');
      expect(alpha.root?.getAttribute('aria-selected')).toBe('true');
      expect(beta.root?.getAttribute('aria-selected')).toBe('false');
      // The fake React harness mounts each part independently, so the initial
      // collection-text notification may arrive before the Root fake renderer;
      // Value still preserves the specified raw-value fallback.
      expect(value.root?.textContent).toBe('alpha');

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await settle();
      expect(document.activeElement).toBe(beta.root);
      beta.root?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await settle();
      expect(root.ref.current.getExposes().value.get()).toBe('beta');
      expect(root.ref.current.getExposes().textValue.get()).toBe('Beta');
      expect(beta.ref.current.getExposes().selected.get()).toBe(true);
      expect(beta.root?.getAttribute('aria-selected')).toBe('true');
    } finally {
      beta.unmount();
      alpha.unmount();
      content.unmount();
      value.unmount();
      trigger.unmount();
      root.unmount();
    }
  });

  it('waits for a conditionally mounted collection before focusing the selected option', async () => {
    // T-BASE-SELECT-CONTENT-0001-CASE-ENTRY-STABILITY
    vi.useFakeTimers();
    const root = createMountedReactAdapter(selectRoot, {
      defaultValue: 'beta',
    });
    const rootEl = root.root as HTMLElement;
    const trigger = createMountedReactAdapterInto(selectTrigger, appendHost(rootEl));
    const value = createMountedReactAdapterInto(selectValue, appendHost(trigger.root!), {
      placeholder: 'Pick one',
    });
    let content: ReturnType<typeof createMountedReactAdapterInto> | null = null;
    let alpha: ReturnType<typeof createMountedReactAdapterInto> | null = null;
    let beta: ReturnType<typeof createMountedReactAdapterInto> | null = null;

    try {
      await settle();
      trigger.root?.click();
      expect(root.ref.current.getExposes().open.get()).toBe(true);

      content = createMountedReactAdapterInto(selectContent, appendHost(rootEl));
      alpha = createMountedReactAdapterInto(selectItem, appendHost(content.root!), {
        value: 'alpha',
        textValue: 'Alpha',
      });
      beta = createMountedReactAdapterInto(selectItem, appendHost(content.root!), {
        value: 'beta',
        textValue: 'Beta',
      });
      await settle();

      expect(document.activeElement).toBe(beta.root);
      expect(alpha.ref.current.getExposes().focused.get()).toBe(false);
      expect(beta.ref.current.getExposes().focused.get()).toBe(true);
    } finally {
      beta?.unmount();
      alpha?.unmount();
      content?.unmount();
      value.unmount();
      trigger.unmount();
      root.unmount();
    }
  });
});
