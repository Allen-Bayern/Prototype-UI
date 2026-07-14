import { describe, expect, it } from 'vitest';
import { styleContains } from '../../test-utils/style';
import { AdaptToWebComponent } from '@proto.ui/adapter-web-component';
import {
  dialogClose,
  dialogContent,
  dialogDescription,
  dialogMask,
  dialogRoot,
  dialogTitle,
  dialogTrigger,
} from '../src/dialog';

AdaptToWebComponent(dialogRoot as any);
AdaptToWebComponent(dialogTrigger as any);
AdaptToWebComponent(dialogMask as any);
AdaptToWebComponent(dialogContent as any);
AdaptToWebComponent(dialogTitle as any);
AdaptToWebComponent(dialogDescription as any);
AdaptToWebComponent(dialogClose as any);

async function completeTransitions(...elements: any[]): Promise<void> {
  for (const element of elements) {
    const exposes = element?.getExposes?.();
    const state = exposes?.transitionState?.get?.();
    if (state === 'entering' || state === 'leaving') exposes.controls.complete();
  }
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe('prototypes/shadcn: dialog', () => {
  it('styles and opens a dialog compound prototype', async () => {
    const root = document.createElement('shadcn-dialog-root') as any;
    const trigger = document.createElement('shadcn-dialog-trigger') as any;
    const mask = document.createElement('shadcn-dialog-mask') as any;
    const content = document.createElement('shadcn-dialog-content') as any;
    const title = document.createElement('shadcn-dialog-title') as any;
    const description = document.createElement('shadcn-dialog-description') as any;
    const close = document.createElement('shadcn-dialog-close') as any;

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(close);
    root.appendChild(trigger);
    root.appendChild(mask);
    root.appendChild(content);
    document.body.appendChild(root);

    await Promise.resolve();
    await Promise.resolve();

    expect(styleContains(trigger, 'rounded-lg')).toBe(true);
    expect(content.hasAttribute('data-pui-view-detached')).toBe(true);
    expect(mask.hasAttribute('data-pui-view-detached')).toBe(true);

    trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(root.getExposes().open.get()).toBe(true);
    expect(content.getExposes().transitionState.get()).toBe('entering');
    expect(mask.getExposes().transitionState.get()).toBe('entering');
    expect(styleContains(content, 'hidden')).toBe(false);
    expect(styleContains(mask, 'hidden')).toBe(false);
    expect(styleContains(content, 'rounded-lg')).toBe(true);
    expect(styleContains(content, 'shadow-lg')).toBe(true);
    expect(styleContains(content, 'data-[open]:animate-in')).toBe(true);
    expect(styleContains(content, 'data-[open]:fade-in-0')).toBe(true);
    expect(styleContains(content, 'data-[open]:zoom-in-95')).toBe(true);
    expect(styleContains(content, 'duration-200')).toBe(true);
    expect(styleContains(mask, 'bg-black/50')).toBe(true);
    expect(styleContains(mask, 'backdrop-blur-xs')).toBe(true);
    expect(styleContains(mask, 'animate-in')).toBe(true);
    expect(styleContains(mask, 'fade-in-0')).toBe(true);
    expect(styleContains(title, 'text-lg')).toBe(true);
    expect(styleContains(description, 'text-muted-foreground')).toBe(true);
    expect(document.activeElement).toBe(close);

    close.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(root.getExposes().open.get()).toBe(false);
    expect(content.getExposes().transitionState.get()).toBe('leaving');
    expect(styleContains(content, 'animate-out')).toBe(true);
    expect(styleContains(content, 'fade-out-0')).toBe(true);
    expect(styleContains(content, 'zoom-out-95')).toBe(true);
    expect(styleContains(mask, 'animate-out')).toBe(true);
    expect(styleContains(mask, 'fade-out-0')).toBe(true);
    await completeTransitions(mask, content);
    expect(content.hasAttribute('data-pui-view-detached')).toBe(true);
    expect(mask.hasAttribute('data-pui-view-detached')).toBe(true);

    root.remove();
    await Promise.resolve();
  });
});
