import { describe, expect, it } from 'vitest';
import { AdaptToWebComponent } from '@proto.ui/adapter-web-component';
import skeletonRoot from '../src/skeleton';

const BaseSkeletonElement = AdaptToWebComponent(skeletonRoot);

describe('prototypes/base: skeleton', () => {
  it('is a hidden, non-interactive visual placeholder', async () => {
    // T-BASE-SKELETON-0001-CASE-VISUAL-ONLY
    const el = new BaseSkeletonElement();
    const interactiveChild = document.createElement('button');
    interactiveChild.textContent = 'must not project';
    el.appendChild(interactiveChild);
    document.body.appendChild(el);
    await Promise.resolve();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-busy')).toBe(false);
    expect(el.tabIndex).toBe(-1);
    expect(el.getExposes()).toEqual({});
    expect(el.childNodes).toHaveLength(0);
    el.remove();
  });
});
