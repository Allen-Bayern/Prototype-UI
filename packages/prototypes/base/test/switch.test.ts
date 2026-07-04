import { describe, expect, it } from 'vitest';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';
import { switchRoot, switchThumb } from '../src/switch';

AdaptToWebComponent(switchRoot as any);
AdaptToWebComponent(switchThumb as any);

describe('prototypes/base: switch', () => {
  it('switch-root owns checked state and emits checkedChange', async () => {
    // T-BASE-SWITCH-0001-CASE-UNCONTROLLED-CHECKED-CHANGE
    const root = document.createElement('base-switch-root') as any;
    const checkedChanges: Array<{ checked: boolean }> = [];
    root.addEventListener('checkedChange', (event: Event) => {
      checkedChanges.push((event as CustomEvent).detail);
    });
    document.body.appendChild(root);

    await Promise.resolve();
    await Promise.resolve();

    const exposes = root.getExposes() as any;
    expect(exposes.checked.get()).toBe(false);
    expect(exposes.click).toBeUndefined();
    expect(root.getAttribute('role')).toBe('switch');
    expect(root.getAttribute('aria-checked')).toBe('false');

    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(exposes.checked.get()).toBe(true);
    expect(checkedChanges).toEqual([{ checked: true }]);
    expect(root.getAttribute('aria-checked')).toBe('true');
    root.remove();
    await Promise.resolve();
  });

  it('controlled switch-root emits next checked without mutating checked', async () => {
    // T-BASE-SWITCH-0001-CASE-CONTROLLED-CHECKED
    const root = document.createElement('base-switch-root') as any;
    const checkedChanges: Array<{ checked: boolean }> = [];
    root.addEventListener('checkedChange', (event: Event) => {
      checkedChanges.push((event as CustomEvent).detail);
    });
    setElementProps(root, { checked: true });
    document.body.appendChild(root);

    await Promise.resolve();
    await Promise.resolve();

    const exposes = root.getExposes() as any;
    expect(exposes.checked.get()).toBe(true);

    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(exposes.checked.get()).toBe(true);
    expect(checkedChanges).toEqual([{ checked: false }]);

    setElementProps(root, { checked: false });
    await Promise.resolve();

    expect(exposes.checked.get()).toBe(false);
    expect(root.getAttribute('aria-checked')).toBe('false');

    root.remove();
    await Promise.resolve();
  });

  it('switch-thumb consumes switch context for repeatable indicator state', async () => {
    // T-BASE-SWITCH-THUMB-0001-CASE-INDICATOR-ROLE
    // T-BASE-SWITCH-THUMB-0001-CASE-CONTEXT-CONSUMPTION
    // T-BASE-SWITCH-THUMB-0001-CASE-NO-INTERACTION-SURFACES
    const root = document.createElement('base-switch-root') as any;
    const firstThumb = document.createElement('base-switch-thumb') as any;
    const secondThumb = document.createElement('base-switch-thumb') as any;
    root.append(firstThumb, secondThumb);
    document.body.appendChild(root);

    await Promise.resolve();
    await Promise.resolve();

    const firstThumbExposes = firstThumb.getExposes();
    const secondThumbExposes = secondThumb.getExposes();

    expect(firstThumbExposes.isChecked()).toBe(false);
    expect(secondThumbExposes.isChecked()).toBe(false);
    expect(firstThumbExposes.checkedChange).toBeUndefined();
    expect(firstThumbExposes.focusSelf).toBeUndefined();

    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(firstThumbExposes.isChecked()).toBe(true);
    expect(secondThumbExposes.isChecked()).toBe(true);

    root.remove();
    await Promise.resolve();
  });

  it('disabled switch-root suppresses checked changes', async () => {
    // T-BASE-SWITCH-0001-CASE-DISABLED-GATING
    const root = document.createElement('base-switch-root') as any;
    const checkedChanges: Array<{ checked: boolean }> = [];
    root.addEventListener('checkedChange', (event: Event) => {
      checkedChanges.push((event as CustomEvent).detail);
    });
    setElementProps(root, { disabled: true });
    document.body.appendChild(root);

    await Promise.resolve();
    await Promise.resolve();

    const exposes = root.getExposes() as any;
    root.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(exposes.checked.get()).toBe(false);
    expect(checkedChanges).toEqual([]);
    root.remove();
    await Promise.resolve();
  });
});
