import { afterEach, describe, expect, it } from 'vitest';
import { installViewVisibilityRule, PUI_VIEW_PENDING_ATTR } from '../src';

describe('adapter-base: view visibility', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('keeps a pending host root hidden until the adapter reveals it', () => {
    const root = document.createElement('div');
    root.setAttribute(PUI_VIEW_PENDING_ATTR, '');
    document.body.appendChild(root);

    installViewVisibilityRule(document);

    expect(getComputedStyle(root).visibility).toBe('hidden');

    root.removeAttribute(PUI_VIEW_PENDING_ATTR);
    expect(getComputedStyle(root).visibility).not.toBe('hidden');
  });
});
