import { describe, expect, it, afterEach } from 'vitest';
import { styleContains } from '../../test-utils/style';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';
import { dropdownContent, dropdownItem, dropdownRoot, dropdownTrigger } from '../src/dropdown';

AdaptToWebComponent(dropdownRoot as any);
AdaptToWebComponent(dropdownTrigger as any);
AdaptToWebComponent(dropdownContent as any);
AdaptToWebComponent(dropdownItem as any);

async function flush(): Promise<void> {
  for (let i = 0; i < 8; i += 1) {
    await Promise.resolve();
  }
}

function teardown(root: Element): void {
  root.remove();
}

describe('prototypes/brutalist: dropdown item contrast', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('opens a square hard-shadowed action menu with default item active styles', async () => {
    expect(dropdownRoot.name).toBe('brutalist-dropdown-root');
    expect(dropdownTrigger.name).toBe('brutalist-dropdown-trigger');
    expect(dropdownContent.name).toBe('brutalist-dropdown-content');
    expect(dropdownItem.name).toBe('brutalist-dropdown-item');

    const root = document.createElement('brutalist-dropdown-root') as any;
    const trigger = document.createElement('brutalist-dropdown-trigger') as any;
    const content = document.createElement('brutalist-dropdown-content') as any;
    const item = document.createElement('brutalist-dropdown-item') as any;
    setElementProps(item, { value: 'profile', textValue: 'Profile' });
    content.appendChild(item);
    root.append(trigger, content);
    document.body.appendChild(root);
    await flush();

    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    expect(root.getExposes().open.get()).toBe(true);
    expect(styleContains(trigger, 'rounded-none')).toBe(true);
    expect(styleContains(content, 'rounded-none')).toBe(true);
    expect(styleContains(content, 'border-2')).toBe(true);
    expect(styleContains(content, 'shadow-[3px_3px_0_0_#000]')).toBe(true);

    item.dispatchEvent(new CustomEvent('pointer.enter'));
    await flush();
    expect(styleContains(item, 'rounded-none')).toBe(true);
    expect(item.getExposes().active.get()).toBe(true);
    expect(styleContains(item, 'bg-main')).toBe(true);
    expect(styleContains(item, 'text-main-foreground')).toBe(true);

    teardown(root);
    await flush();
  });

  it('keeps destructive pairing when active (no main-accent override)', async () => {
    const root = document.createElement('brutalist-dropdown-root') as any;
    const trigger = document.createElement('brutalist-dropdown-trigger') as any;
    const content = document.createElement('brutalist-dropdown-content') as any;
    const item = document.createElement('brutalist-dropdown-item') as any;
    setElementProps(item, { value: 'del', textValue: 'Delete', variant: 'destructive' });
    content.appendChild(item);
    root.append(trigger, content);
    document.body.appendChild(root);
    await flush();

    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();
    item.dispatchEvent(new CustomEvent('pointer.enter'));
    await flush();

    expect(item.getExposes().active.get()).toBe(true);
    // Destructive stays paired under active: the bg-* and text-* slots are
    // replaced with the destructive pair, never the main accent and never a
    // 10% tint with un-paired text.
    expect(styleContains(item, 'bg-destructive')).toBe(true);
    expect(styleContains(item, 'text-destructive-foreground')).toBe(true);
    expect(styleContains(item, 'bg-main')).toBe(false);
    expect(styleContains(item, 'bg-destructive/10')).toBe(false);

    teardown(root);
    await flush();
  });

  it('keeps a deliberate background/foreground pair when disabled', async () => {
    const root = document.createElement('brutalist-dropdown-root') as any;
    const trigger = document.createElement('brutalist-dropdown-trigger') as any;
    const content = document.createElement('brutalist-dropdown-content') as any;
    const item = document.createElement('brutalist-dropdown-item') as any;
    setElementProps(item, { value: 'del', textValue: 'Delete', disabled: true });
    content.appendChild(item);
    root.append(trigger, content);
    document.body.appendChild(root);
    await flush();

    // Disabled must not rely on opacity over a transparent background: the
    // item needs an explicit paper background and a muted foreground so the
    // row is readable (review defect: white bg + pale pink text).
    expect(styleContains(item, 'bg-secondary-background')).toBe(true);
    expect(styleContains(item, 'data-[disabled]:bg-secondary-background')).toBe(true);
    expect(styleContains(item, 'data-[disabled]:text-muted-foreground')).toBe(true);
    expect(styleContains(item, 'data-[disabled]:pointer-events-none')).toBe(true);

    teardown(root);
    await flush();
  });
});
