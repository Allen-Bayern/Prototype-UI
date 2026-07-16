import { afterEach, bench, describe } from 'vitest';
import { AdaptToWebComponent, setElementProps } from '@proto.ui/adapter-web-component';
import button from '../src/button';
import { hoverCardContent, hoverCardRoot, hoverCardTrigger } from '../src/hover-card';

AdaptToWebComponent(button as any);
AdaptToWebComponent(hoverCardRoot as any);
AdaptToWebComponent(hoverCardTrigger as any);
AdaptToWebComponent(hoverCardContent as any);

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

async function mountHoverCard() {
  const root = document.createElement('base-hover-card-root') as HTMLElement;
  const trigger = document.createElement('base-hover-card-trigger') as HTMLElement;
  const content = document.createElement('base-hover-card-content') as HTMLElement;
  setElementProps(root, { openDelay: 150, closeDelay: 300 });
  root.append(trigger, content);
  document.body.appendChild(root);
  await settle();
  return { root, trigger, content };
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('base Hover Card performance', () => {
  bench('mounts a closed Root + Trigger + Content compound', async () => {
    const { root } = await mountHoverCard();
    root.remove();
    await settle();
  });

  bench('processes 100 canceled Trigger pointer boundary pairs', async () => {
    const { root, trigger } = await mountHoverCard();
    for (let index = 0; index < 100; index += 1) {
      trigger.dispatchEvent(new Event('pointerenter'));
      trigger.dispatchEvent(new Event('pointerleave'));
    }
    root.remove();
    await settle();
  });

  bench('control: processes 100 Button pointer boundary pairs', async () => {
    const control = document.createElement('base-button');
    document.body.appendChild(control);
    await settle();
    for (let index = 0; index < 100; index += 1) {
      control.dispatchEvent(new Event('pointerenter'));
      control.dispatchEvent(new Event('pointerleave'));
    }
    control.remove();
    await settle();
  });
});
