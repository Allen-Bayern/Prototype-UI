import { describe, expect, it } from 'vitest';
import type { TextControlEvent } from '@proto.ui/core';
import { createWebTextControlHost } from '../src/web';

describe('module-text-control web bridge', () => {
  it('projects the supported textarea properties and live updates', () => {
    const textarea = document.createElement('textarea');
    const lease = createWebTextControlHost(() => textarea).attach({
      patch: {
        valueMode: 'uncontrolled',
        defaultValue: 'initial',
        disabled: true,
        readOnly: true,
        placeholder: 'Write',
        rows: 4,
        required: true,
        name: 'notes',
        autoComplete: 'off',
        minLength: 3,
        maxLength: 100,
        wrap: 'hard',
      },
      onEvent() {},
    });

    expect(textarea.value).toBe('initial');
    expect(textarea.defaultValue).toBe('initial');
    expect(textarea.disabled).toBe(true);
    expect(textarea.readOnly).toBe(true);
    expect(textarea.placeholder).toBe('Write');
    expect(Number(textarea.rows)).toBe(4);
    expect(textarea.required).toBe(true);
    expect(textarea.name).toBe('notes');
    expect(textarea.autocomplete).toBe('off');
    expect(textarea.minLength).toBe(3);
    expect(textarea.maxLength).toBe(100);
    expect(textarea.wrap).toBe('hard');

    lease.update({
      valueMode: 'controlled',
      value: 'updated',
      defaultValue: 'next default',
      disabled: false,
      readOnly: false,
      placeholder: 'Compose',
      rows: 7,
      required: false,
      name: 'updated-notes',
      autoComplete: 'on',
      minLength: 1,
      maxLength: 200,
      wrap: 'soft',
    });
    expect(textarea.value).toBe('updated');
    expect(textarea.defaultValue).toBe('next default');
    expect(textarea.disabled).toBe(false);
    expect(textarea.readOnly).toBe(false);
    expect(textarea.placeholder).toBe('Compose');
    expect(Number(textarea.rows)).toBe(7);
    expect(textarea.required).toBe(false);
    expect(textarea.name).toBe('updated-notes');
    expect(textarea.autocomplete).toBe('on');
    expect(textarea.minLength).toBe(1);
    expect(textarea.maxLength).toBe(200);
    expect(textarea.wrap).toBe('soft');
    expect(lease.snapshot()).toEqual({ value: 'updated', composing: false });
    lease.dispose();
  });

  it('normalizes input, change, and IME composition without leaking native events', () => {
    const textarea = document.createElement('textarea');
    const seen: TextControlEvent[] = [];
    const lease = createWebTextControlHost(() => textarea).attach({
      patch: { valueMode: 'controlled', value: 'fixed' },
      onEvent: (event) => seen.push(event),
    });
    const compositionEvent = (type: string, data: string) => {
      const event = new CompositionEvent(type, { bubbles: true });
      Object.defineProperty(event, 'data', { value: data });
      return event;
    };

    textarea.dispatchEvent(compositionEvent('compositionstart', ''));
    textarea.value = '編集中';
    const inputEvent = new InputEvent('input', { bubbles: true });
    Object.defineProperties(inputEvent, {
      data: { value: '中' },
      inputType: { value: 'insertCompositionText' },
      isComposing: { value: true },
    });
    textarea.dispatchEvent(inputEvent);
    textarea.dispatchEvent(compositionEvent('compositionupdate', '編集中'));
    textarea.dispatchEvent(compositionEvent('compositionend', '編集中'));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(seen).toEqual([
      {
        type: 'compositionstart',
        value: 'fixed',
        composing: true,
        data: '',
        inputType: null,
      },
      {
        type: 'input',
        value: '編集中',
        composing: true,
        data: '中',
        inputType: 'insertCompositionText',
      },
      {
        type: 'compositionupdate',
        value: '編集中',
        composing: true,
        data: '編集中',
        inputType: null,
      },
      {
        type: 'compositionend',
        value: '編集中',
        composing: false,
        data: '編集中',
        inputType: null,
      },
      {
        type: 'change',
        value: '編集中',
        composing: false,
        data: null,
        inputType: null,
      },
    ]);

    lease.dispose();
    textarea.value = 'ignored';
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(seen).toHaveLength(5);
  });
});
