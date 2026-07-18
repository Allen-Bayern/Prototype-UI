import { definePrototype, delay, type RendererHandle, tw } from '@proto.ui/core';
import { asSelectItem } from '@proto.ui/prototypes-base';
import type { ShadcnSelectItemExposes, ShadcnSelectItemProps } from './types';

function renderCheck(renderer: Pick<RendererHandle<any>, 'svg' | 'el'>, selected: boolean) {
  return renderer.el(
    'span',
    { style: tw('pointer-events-none flex size-5 shrink-0 items-center justify-center') },
    selected
      ? renderer.svg.root(
          {
            viewBox: '0 0 24 24',
            width: 16,
            height: 16,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          },
          renderer.svg.path({ d: 'm20 6-11 11-5-5' })
        )
      : null
  );
}

const selectItem = definePrototype<ShadcnSelectItemProps, ShadcnSelectItemExposes>({
  name: 'shadcn-select-item',
  setup(def) {
    const state = asSelectItem().stateHandles;
    if (!state) throw new Error('[shadcn-select-item] Select Item must project option states.');
    const { disabled, hovered, focused, focusVisible, pressed, active, selected } = state;

    def.feedback.style.use(
      tw(
        'relative flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none'
      )
    );
    def.rule({
      when: (w) =>
        w.any(
          w.state(active).eq(true),
          w.state(hovered).eq(true),
          w.state(focused).eq(true),
          w.state(focusVisible).eq(true)
        ),
      intent: (i) => i.feedback.style.use(tw('bg-accent text-accent-foreground')),
    });
    def.rule({
      when: (w) => w.state(pressed).eq(true),
      intent: (i) => i.feedback.style.use(tw('bg-accent/80')),
    });
    def.rule({
      when: (w) => w.state(disabled).eq(true),
      intent: (i) => i.feedback.style.use(tw('pointer-events-none opacity-50')),
    });

    let renderTask: { cancel(): void } | null = null;
    selected.watch((run, event) => {
      if (event.type !== 'next') return;
      renderTask?.cancel();
      renderTask = delay(0, () => {
        renderTask = null;
        run.update();
      });
    });
    def.lifecycle.onUnmounted(() => {
      renderTask?.cancel();
      renderTask = null;
    });

    return (renderer) => [renderer.r.slot(), renderCheck(renderer, selected.get())];
  },
});

export default selectItem;
