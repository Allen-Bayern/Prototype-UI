import type { TextControlEvent, TextControlPatch, TextControlSnapshot } from '@proto.ui/core';
import type { TextControlHost, TextControlHostConnection, TextControlHostLease } from './caps';
import type { TextControlDeclaration } from './declaration';

export type WebTextControl = HTMLTextAreaElement;
export type WebTextControlLocalName = 'textarea';

export function resolveWebTextControlLocalName(
  declaration: TextControlDeclaration
): WebTextControlLocalName {
  if (
    declaration.content !== 'plain-text' ||
    declaration.lineMode !== 'multiline' ||
    declaration.engine !== 'host'
  ) {
    throw new Error('[TextControl] unsupported Web text-control declaration.');
  }
  return 'textarea';
}

export function createWebTextControlHost(
  getTarget: () => WebTextControl | null,
  options: Readonly<{ stopPropagation?: boolean }> = {}
): TextControlHost {
  return {
    attach(connection) {
      const target = getTarget();
      if (!target) throw new Error('[TextControl] physical web textarea target is unavailable.');
      return attachTarget(target, connection, options);
    },
  };
}

function attachTarget(
  target: WebTextControl,
  connection: TextControlHostConnection,
  options: Readonly<{ stopPropagation?: boolean }>
): TextControlHostLease {
  let patch = connection.patch;
  let composing = false;
  let disposed = false;

  const emit = (event: Event) => {
    if (disposed) return;
    if (options.stopPropagation) event.stopPropagation();
    const type = event.type as TextControlEvent['type'];
    const inputEvent = event instanceof InputEvent ? event : null;
    const compositionEvent = event instanceof CompositionEvent ? event : null;
    if (type === 'compositionstart') composing = true;
    if (inputEvent?.isComposing) composing = true;
    if (type === 'compositionend') composing = false;
    connection.onEvent(
      Object.freeze({
        type,
        value: target.value,
        composing,
        data: inputEvent?.data ?? compositionEvent?.data ?? null,
        inputType: inputEvent?.inputType ?? null,
      })
    );
  };

  const eventTypes = [
    'input',
    'change',
    'compositionstart',
    'compositionupdate',
    'compositionend',
  ] as const;
  for (const type of eventTypes) target.addEventListener(type, emit);
  applyPatch(target, patch);

  return {
    update(next) {
      if (disposed) return;
      patch = next;
      applyPatch(target, patch);
    },
    snapshot(): TextControlSnapshot {
      return Object.freeze({ value: target.value, composing });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const type of eventTypes) target.removeEventListener(type, emit);
    },
  };
}

function applyPatch(target: WebTextControl, patch: TextControlPatch): void {
  if (typeof patch.defaultValue === 'string' && target.defaultValue !== patch.defaultValue) {
    target.defaultValue = patch.defaultValue;
  }
  const value =
    patch.value ?? (patch.valueMode === 'uncontrolled' ? patch.defaultValue : undefined);
  if (typeof value === 'string' && target.value !== value) {
    replaceValuePreservingSelection(target, value);
  }
  if (typeof patch.disabled === 'boolean') target.disabled = patch.disabled;
  if (typeof patch.readOnly === 'boolean') target.readOnly = patch.readOnly;
  if (typeof patch.placeholder === 'string') target.placeholder = patch.placeholder;
  if (typeof patch.rows === 'number' && Number.isFinite(patch.rows)) {
    target.rows = Math.max(1, Math.trunc(patch.rows));
  }
  if (typeof patch.required === 'boolean') target.required = patch.required;
  if (typeof patch.name === 'string') target.name = patch.name;
  if (typeof patch.autoComplete === 'string') {
    if (patch.autoComplete) target.setAttribute('autocomplete', patch.autoComplete);
    else target.removeAttribute('autocomplete');
  }
  if (typeof patch.minLength === 'number' && Number.isFinite(patch.minLength)) {
    const minLength = Math.trunc(patch.minLength);
    if (minLength < 0) target.removeAttribute('minlength');
    else target.minLength = minLength;
  }
  if (typeof patch.maxLength === 'number' && Number.isFinite(patch.maxLength)) {
    const maxLength = Math.trunc(patch.maxLength);
    if (maxLength < 0) target.removeAttribute('maxlength');
    else target.maxLength = maxLength;
  }
  if (patch.wrap === 'soft' || patch.wrap === 'hard') target.wrap = patch.wrap;
}

function replaceValuePreservingSelection(target: WebTextControl, value: string): void {
  const selectionStart = target.selectionStart;
  const selectionEnd = target.selectionEnd;
  const selectionDirection = target.selectionDirection;
  target.value = value;
  const nextLength = value.length;
  target.setSelectionRange(
    Math.min(selectionStart, nextLength),
    Math.min(selectionEnd, nextLength),
    selectionDirection
  );
}
