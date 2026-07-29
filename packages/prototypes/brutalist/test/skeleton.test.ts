import { describe, expect, it } from 'vitest';
import { styleContains } from '../../test-utils/style';
import { AdaptToWebComponent } from '@proto.ui/adapter-web-component';
import { BrutalistSkeletonRoot } from '../src/skeleton';

const BrutalistSkeletonElement = AdaptToWebComponent(BrutalistSkeletonRoot);

describe('prototypes/brutalist: skeleton', () => {
  it('inherits visual-only semantics without claiming consumer-owned size', async () => {
    // T-BRUTALIST-SKELETON-0001-CASE-VISUAL-ONLY
    const el = new BrutalistSkeletonElement();
    const interactiveChild = document.createElement('button');
    interactiveChild.textContent = 'must not project';
    el.appendChild(interactiveChild);
    document.body.appendChild(el);
    await Promise.resolve();
    await Promise.resolve();

    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.hasAttribute('role')).toBe(false);
    expect(el.hasAttribute('aria-busy')).toBe(false);
    expect(el.tabIndex).toBe(-1);
    expect(el.getExposes()).toEqual({});
    expect(el.childNodes).toHaveLength(0);
    for (const token of [
      'block',
      'rounded-none',
      'border-2',
      'border-foreground',
      'bg-lavender',
      'shadow-[2px_2px_0_0_var(--pui-foreground)]',
    ]) {
      expect(styleContains(el, token)).toBe(true);
    }
    const tokens = (el.getAttribute('data-pui-style') ?? '').split(/\s+/).filter(Boolean);
    expect(tokens.some((token) => /^(?:w|h|min-w|min-h|max-w|max-h)-/.test(token))).toBe(false);
    expect(tokens.some((token) => /(?:animate|motion|pulse|spin|bounce)/.test(token))).toBe(false);
    el.remove();
  });
});
