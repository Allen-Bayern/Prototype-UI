import { describe, expect, it } from 'vitest';
import { styleContains } from '../../test-utils/style';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';
import { switchRoot, switchThumb } from '../src/switch';

AdaptToWebComponent(switchRoot as any);
AdaptToWebComponent(switchThumb as any);

async function flush(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
}

describe('prototypes/brutalist: switch geometry', () => {
  it('uses a single thumb-travel mechanism when checked (no double movement)', async () => {
    const root = document.createElement('brutalist-switch-root') as any;
    const thumb = document.createElement('brutalist-switch-thumb') as any;
    root.appendChild(thumb);
    document.body.appendChild(root);
    await flush();

    // Symmetric Root padding: the track never shifts the thumb's slot. Only
    // the Thumb translates when checked, so the thumb moves exactly once.
    expect(styleContains(root, 'px-0.5')).toBe(true);
    expect(styleContains(root, 'pl-0.5')).toBe(false);
    expect(styleContains(root, 'pr-5')).toBe(false);

    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(root.getExposes().checked.get()).toBe(true);
    expect(thumb.getExposes().isChecked()).toBe(true);

    // Thumb owns the only movement: checked translate + canary fill.
    expect(styleContains(thumb, 'data-[checked]:translate-x-5')).toBe(true);
    expect(styleContains(thumb, 'data-[checked]:bg-canary')).toBe(true);

    // Checked Root swaps only its fill, never its padding.
    expect(styleContains(root, 'data-[checked]:bg-sky')).toBe(true);
    expect(styleContains(root, 'data-[checked]:pl-5')).toBe(false);
    expect(styleContains(root, 'data-[checked]:pr-0.5')).toBe(false);

    root.remove();
    await flush();
  });

  it('keeps the thumb on the left when unchecked', async () => {
    const root = document.createElement('brutalist-switch-root') as any;
    const thumb = document.createElement('brutalist-switch-thumb') as any;
    root.appendChild(thumb);
    document.body.appendChild(root);
    await flush();

    expect(root.getExposes().checked.get()).toBe(false);
    expect(styleContains(thumb, 'translate-x-0')).toBe(true);

    root.remove();
    await flush();
  });

  it('disabled checked switch keeps the checked fill pairing visible', async () => {
    const root = document.createElement('brutalist-switch-root') as any;
    const thumb = document.createElement('brutalist-switch-thumb') as any;
    setElementProps(root, { disabled: true, defaultChecked: true });
    root.appendChild(thumb);
    document.body.appendChild(root);
    await flush();

    expect(styleContains(root, 'data-[checked]:bg-sky')).toBe(true);
    expect(styleContains(thumb, 'data-[checked]:bg-canary')).toBe(true);
    expect(styleContains(root, 'data-[disabled]:opacity-50')).toBe(true);

    root.remove();
    await flush();
  });
});
