import { describe, expect, it } from 'vitest';
import { styleContains } from '../../test-utils/style';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';
import {
  BrutalistScrollAreaRoot,
  BrutalistScrollAreaViewport,
  BrutalistScrollAreaScrollbar,
  BrutalistScrollAreaThumb,
} from '../src/scroll-area';

AdaptToWebComponent(BrutalistScrollAreaRoot as any);
AdaptToWebComponent(BrutalistScrollAreaViewport as any);
AdaptToWebComponent(BrutalistScrollAreaScrollbar as any);
AdaptToWebComponent(BrutalistScrollAreaThumb as any);

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('prototypes/brutalist: scroll-area', () => {
  it('projects the Brutalist visual grammar', async () => {
    const el = document.createElement('brutalist-scroll-area-root') as any;
    document.body.appendChild(el);
    await flush();
    expect(styleContains(el, 'rounded-none')).toBe(true);
    expect(styleContains(el, 'border-2')).toBe(true);

    const scrollbar = document.createElement('brutalist-scroll-area-scrollbar') as any;
    document.body.appendChild(scrollbar);
    await flush();
    expect(styleContains(scrollbar, 'absolute')).toBe(true);
    expect(styleContains(scrollbar, 'right-0')).toBe(true);
    expect(styleContains(scrollbar, 'top-0')).toBe(true);

    const horizontalScrollbar = document.createElement('brutalist-scroll-area-scrollbar') as any;
    setElementProps(horizontalScrollbar, { orientation: 'horizontal' });
    document.body.appendChild(horizontalScrollbar);
    await flush();
    expect(styleContains(horizontalScrollbar, 'bottom-0')).toBe(true);
    expect(styleContains(horizontalScrollbar, 'left-0')).toBe(true);

    el.remove();
    scrollbar.remove();
    horizontalScrollbar.remove();
  });
});
