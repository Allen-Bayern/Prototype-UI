import { defineAsHook, definePrototype, tw, type DefHandle } from '@proto.ui/core';
import { asOverlay } from '@proto.ui/hooks';
import { asTransition } from '../tools';
import { HOVER_CARD_CONTEXT, HOVER_CARD_FAMILY, updateHoverCardInteraction } from './shared';
import type {
  HoverCardContentAsHookContract,
  HoverCardContentExposes,
  HoverCardContentHandles,
  HoverCardContentProps,
} from './types';

function projectHoverCardContentHandle(
  result: import('@proto.ui/core').AsHookResult<
    HoverCardContentProps,
    HoverCardContentAsHookContract
  >
): HoverCardContentHandles {
  const open = result.getState?.('open');
  const asTransition = result.getAsHookHandle?.('asTransition');
  if (!open || !asTransition) {
    throw new Error('[as-hover-card-content] missing captured Hover Card or Transition handles.');
  }
  return { stateHandles: { open }, asTransition };
}

function setupHoverCardContent(
  def: DefHandle<HoverCardContentProps, HoverCardContentExposes>
): void {
  // P-BASE-HOVER-CARD-CONTENT-SURFACE
  def.anatomy.claim(HOVER_CARD_FAMILY, { role: 'content' });
  def.props.define({
    side: {
      type: 'enum',
      empty: 'fallback',
      options: ['top', 'right', 'bottom', 'left'],
    },
    align: {
      type: 'enum',
      empty: 'fallback',
      options: ['start', 'center', 'end'],
    },
  });
  def.props.setDefaults({ side: 'bottom', align: 'center' });

  // P-BASE-HOVER-CARD-CONTENT-OVERLAY
  const overlay = asOverlay<HoverCardContentProps>();
  overlay.configure({
    closeOnEscape: false,
    closeOnOutsidePress: false,
    closeOnFocusOutside: false,
    restore: 'none',
    entry: 'manual',
    placement: 'bottom',
    align: 'center',
    sideOffset: 4,
    modal: false,
    layerRole: 'hover-card-content',
    meta: { overlayKind: 'hover-card' },
  });

  // P-BASE-HOVER-CARD-CONTENT-PRESENCE
  const transition = asTransition();
  overlay.bindPresence({
    enter: transition.controls.enter,
    leave: transition.controls.leave,
    present: transition.isPresent,
  });

  const open = def.state.bool('open', false);
  const hovered = def.state.bool('hovered', false);
  def.expose.state('open', open);

  const updateOpen = (nextOpen: boolean, reason: string) => {
    open.set(nextOpen, reason);
    if (nextOpen) overlay.openOverlay(reason);
    else overlay.close(reason);
  };

  def.context.subscribe(HOVER_CARD_CONTEXT, (_run, next) => {
    updateOpen(next.open, 'reason: hover-card context sync => content open');
  });
  def.lifecycle.onCreated((run) => {
    const ctx = run.context.read(HOVER_CARD_CONTEXT);
    updateOpen(ctx.open, 'reason: lifecycle.onCreated => hover-card content open sync');
  });
  def.lifecycle.onMounted((run) => {
    const ctx = run.context.read(HOVER_CARD_CONTEXT);
    updateOpen(ctx.open, 'reason: lifecycle.onMounted => hover-card content open sync');
  });
  def.lifecycle.onUnmounted(() => {
    hovered.set(false, 'reason: hover-card content unmounted => hovered false');
  });

  // P-BASE-HOVER-CARD-CONTENT-HOVER-BRIDGE
  def.event.on('pointer.enter', (run) => {
    hovered.set(true, 'reason: hover-card content pointer.enter');
    updateHoverCardInteraction(run, { contentHovered: true }, 'content.pointerenter');
  });
  def.event.on('pointer.leave', (run) => {
    hovered.set(false, 'reason: hover-card content pointer.leave');
    updateHoverCardInteraction(run, { contentHovered: false }, 'content.pointerleave');
  });

  def.rule({
    // P-BASE-HOVER-CARD-CONTENT-PRESENCE
    when: (w) => w.state(transition.isPresent).eq(false),
    intent: (i) => i.feedback.style.use(tw('hidden')),
  });

  // P-BASE-HOVER-CARD-CONTENT-POSITION
  def.rule({
    when: (w) => w.prop('side').eq('bottom'),
    intent: (i) => i.feedback.style.use(tw('left-1/2 top-full mt-1 -translate-x-1/2')),
  });
  def.rule({
    when: (w) => w.prop('side').eq('top'),
    intent: (i) => i.feedback.style.use(tw('bottom-full left-1/2 mb-1 -translate-x-1/2')),
  });
  def.rule({
    when: (w) => w.prop('side').eq('right'),
    intent: (i) => i.feedback.style.use(tw('left-full top-1/2 ml-1 -translate-y-1/2')),
  });
  def.rule({
    when: (w) => w.prop('side').eq('left'),
    intent: (i) => i.feedback.style.use(tw('right-full top-1/2 mr-1 -translate-y-1/2')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('start'), w.prop('side').eq('bottom')),
    intent: (i) => i.feedback.style.use(tw('left-0 translate-x-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('start'), w.prop('side').eq('top')),
    intent: (i) => i.feedback.style.use(tw('left-0 translate-x-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('end'), w.prop('side').eq('bottom')),
    intent: (i) => i.feedback.style.use(tw('left-auto right-0 translate-x-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('end'), w.prop('side').eq('top')),
    intent: (i) => i.feedback.style.use(tw('left-auto right-0 translate-x-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('start'), w.prop('side').eq('left')),
    intent: (i) => i.feedback.style.use(tw('top-0 translate-y-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('start'), w.prop('side').eq('right')),
    intent: (i) => i.feedback.style.use(tw('top-0 translate-y-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('end'), w.prop('side').eq('left')),
    intent: (i) => i.feedback.style.use(tw('bottom-0 top-auto translate-y-0')),
  });
  def.rule({
    when: (w) => w.all(w.prop('align').eq('end'), w.prop('side').eq('right')),
    intent: (i) => i.feedback.style.use(tw('bottom-0 top-auto translate-y-0')),
  });
}

/*
 * P-BASE-HOVER-CARD-CONTENT-NON-MODAL: no focus scope, outside dismissal,
 * Escape dismissal, or dialog semantics are authored by Content.
 * P-BASE-HOVER-CARD-CONTENT-DEFERRED-EXTENSIONS: portal, collision geometry,
 * Arrow, forceMount, and numeric offsets remain downstream extensions.
 */

// P-BASE-HOVER-CARD-CONTENT-AUTHORING-ENTRIES
export const asHoverCardContent = defineAsHook<
  HoverCardContentProps,
  HoverCardContentExposes,
  HoverCardContentAsHookContract,
  HoverCardContentHandles
>({
  name: 'as-hover-card-content',
  setup: setupHoverCardContent,
  projectHandle: projectHoverCardContentHandle,
});

const hoverCardContent = definePrototype({
  name: 'base-hover-card-content',
  setup(def) {
    setupHoverCardContent(def);
    def.feedback.style.use(tw('absolute z-40'));
  },
});

export default hoverCardContent;
