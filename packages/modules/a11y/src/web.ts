import type { A11ySemanticObjectSnapshot } from '@proto.ui/core';

import type { A11yProjector } from './caps';

const ARIA_STATE_ATTRS: Record<string, string> = {
  checked: 'aria-checked',
  disabled: 'aria-disabled',
  expanded: 'aria-expanded',
  hasPopup: 'aria-haspopup',
  invalid: 'aria-invalid',
  orientation: 'aria-orientation',
  pressed: 'aria-pressed',
  selected: 'aria-selected',
  modal: 'aria-modal',
};

const ARIA_RELATION_ATTRS: Record<string, string> = {
  controls: 'aria-controls',
  describedBy: 'aria-describedby',
  labelledBy: 'aria-labelledby',
};

export function createWebA11yProjector(
  target: HTMLElement | (() => HTMLElement | null),
  subscribeTargetChange?: (listener: () => void) => () => void
): A11yProjector {
  const getTarget = typeof target === 'function' ? target : () => target;
  let lastTarget: HTMLElement | null = null;
  let lastSnapshot: A11ySemanticObjectSnapshot | null = null;

  const project = (snapshot: A11ySemanticObjectSnapshot) => {
    const nextTarget = getTarget();
    if (lastTarget && lastTarget !== nextTarget && lastSnapshot) {
      clearWebA11ySnapshot(lastTarget, lastSnapshot);
    }
    lastTarget = nextTarget;
    lastSnapshot = snapshot;
    if (nextTarget) applyWebA11ySnapshot(nextTarget, snapshot);
  };

  subscribeTargetChange?.(() => {
    if (lastSnapshot) project(lastSnapshot);
  });

  return project;
}

export function clearWebA11ySnapshot(el: HTMLElement, snapshot: A11ySemanticObjectSnapshot): void {
  if (typeof snapshot.id !== 'undefined') el.removeAttribute('id');
  if (typeof snapshot.role !== 'undefined') el.removeAttribute('role');
  if (snapshot.name) el.removeAttribute('aria-label');
  if (snapshot.description) el.removeAttribute('aria-description');

  for (const [key, attr] of Object.entries(ARIA_STATE_ATTRS)) {
    if (Object.prototype.hasOwnProperty.call(snapshot.states, key)) el.removeAttribute(attr);
  }
  if (Object.prototype.hasOwnProperty.call(snapshot.states, 'hidden')) {
    el.removeAttribute('aria-hidden');
    el.removeAttribute('hidden');
  }
  for (const [key, attr] of Object.entries(ARIA_RELATION_ATTRS)) {
    if (Object.prototype.hasOwnProperty.call(snapshot.relations, key)) el.removeAttribute(attr);
  }
  if (Object.keys(snapshot.actions).length) el.removeAttribute('data-pui-a11y-actions');
  if (snapshot.tree) {
    if (Object.prototype.hasOwnProperty.call(snapshot.tree, 'hidden')) {
      el.removeAttribute('aria-hidden');
    }
    if (Object.prototype.hasOwnProperty.call(snapshot.tree, 'mergeChildren')) {
      el.removeAttribute('data-pui-a11y-merge-children');
    }
  }
}

export function applyWebA11ySnapshot(el: HTMLElement, snapshot: A11ySemanticObjectSnapshot): void {
  if (typeof snapshot.id !== 'undefined') {
    setOptionalAttr(el, 'id', snapshot.id ?? undefined);
  }

  if (typeof snapshot.role !== 'undefined') {
    setOptionalAttr(el, 'role', snapshot.role);
  }

  if (snapshot.name) {
    if (snapshot.name.kind === 'text') {
      setOptionalAttr(el, 'aria-label', readTextTarget(snapshot.name.value));
    } else {
      el.removeAttribute('aria-label');
    }
  }

  if (snapshot.description) {
    if (snapshot.description.kind === 'text') {
      setOptionalAttr(el, 'aria-description', readTextTarget(snapshot.description.value));
    } else {
      el.removeAttribute('aria-description');
    }
  }

  for (const [key, attr] of Object.entries(ARIA_STATE_ATTRS)) {
    if (Object.prototype.hasOwnProperty.call(snapshot.states, key)) {
      setA11yStateAttr(el, attr, snapshot.states[key]);
    }
  }

  if (Object.prototype.hasOwnProperty.call(snapshot.states, 'hidden')) {
    setA11yStateAttr(el, 'aria-hidden', snapshot.states.hidden);
    setBooleanPresenceAttr(el, 'hidden', snapshot.states.hidden);
  }

  for (const [key, attr] of Object.entries(ARIA_RELATION_ATTRS)) {
    if (Object.prototype.hasOwnProperty.call(snapshot.relations, key)) {
      setOptionalAttr(el, attr, snapshot.relations[key] ?? undefined);
    }
  }

  const actionKeys = Object.keys(snapshot.actions).sort();
  if (actionKeys.length) {
    setOptionalAttr(el, 'data-pui-a11y-actions', actionKeys.join(' '));
  }

  if (snapshot.tree) {
    if (Object.prototype.hasOwnProperty.call(snapshot.tree, 'hidden')) {
      setA11yStateAttr(el, 'aria-hidden', snapshot.tree.hidden);
    }
    if (Object.prototype.hasOwnProperty.call(snapshot.tree, 'mergeChildren')) {
      setA11yStateAttr(el, 'data-pui-a11y-merge-children', snapshot.tree.mergeChildren);
    }
  }
}

function setOptionalAttr(el: HTMLElement, attr: string, value: string | undefined): void {
  if (value === undefined || value === '') {
    el.removeAttribute(attr);
    return;
  }
  el.setAttribute(attr, value);
}

function readTextTarget(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (
    value &&
    typeof value === 'object' &&
    typeof (value as { get?: unknown }).get === 'function'
  ) {
    const next = (value as { get(): unknown }).get();
    return typeof next === 'string' ? next : undefined;
  }
  return undefined;
}

function setA11yStateAttr(el: HTMLElement, attr: string, value: unknown): void {
  if (value === undefined || value === null || value === '') {
    el.removeAttribute(attr);
    return;
  }
  if (typeof value === 'boolean') {
    el.setAttribute(attr, value ? 'true' : 'false');
    return;
  }
  el.setAttribute(attr, String(value));
}

function setBooleanPresenceAttr(el: HTMLElement, attr: string, value: unknown): void {
  if (value === true) {
    el.setAttribute(attr, '');
    return;
  }
  el.removeAttribute(attr);
}
