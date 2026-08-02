import { describe, expect, it } from 'vitest';
import { definePrototype, type DefHandle, type TextControlPatch } from '@proto.ui/core';
import { asTextControl } from '@proto.ui/hooks';
import { declareTextControl } from '@proto.ui/module-text-control';
import { AdaptToWebComponent, setElementProps, type WebComponentAdapterElement } from '../src';

const moduleInputValues: string[] = [];
type ControlProps = { defaultValue?: string; placeholder?: string; rows?: number };

const textareaPrototype = definePrototype({
  name: 'x-wc-text-control',
  modules: [declareTextControl({ content: 'plain-text', lineMode: 'multiline', engine: 'host' })],
  setup(def: DefHandle<ControlProps>) {
    def.props.define({
      defaultValue: { type: 'string', empty: 'fallback' },
      placeholder: { type: 'string', empty: 'fallback' },
      rows: { type: 'number', empty: 'fallback' },
    });
    const control = asTextControl<ControlProps>();
    control.on('input', (_run, event) => moduleInputValues.push(event.value));
    const sync = (props: Readonly<ControlProps>) => {
      const patch: TextControlPatch = {
        valueMode: 'uncontrolled',
        defaultValue: props.defaultValue,
        placeholder: props.placeholder,
        rows: props.rows,
      };
      control.sync(patch);
    };
    def.lifecycle.onCreated((run) => sync(run.props.get()));
    def.props.watchAll((_run, next) => sync(next));
    return () => null;
  },
});

AdaptToWebComponent(textareaPrototype);

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('adapter-web-component text control', () => {
  it('retains the custom root and owns one physical textarea', async () => {
    const shell = document.createElement('x-wc-text-control') as WebComponentAdapterElement<
      typeof textareaPrototype
    >;
    setElementProps(shell, { defaultValue: 'initial', placeholder: 'Write', rows: 6 });
    document.body.appendChild(shell);
    await flush();
    const textarea = shell.querySelector('textarea');
    expect(shell.tagName.toLowerCase()).toBe('x-wc-text-control');
    expect(shell.querySelectorAll('textarea')).toHaveLength(1);
    expect(textarea?.value).toBe('initial');
    expect(textarea?.defaultValue).toBe('initial');
    expect(textarea?.placeholder).toBe('Write');
    expect(Number(textarea?.rows)).toBe(6);
    textarea?.focus();
    expect(document.activeElement).toBe(textarea);
    shell.blur();
    expect(document.activeElement).not.toBe(textarea);

    const leakedNativeInputs: Event[] = [];
    shell.addEventListener('input', (event) => leakedNativeInputs.push(event));
    if (!textarea) throw new Error('physical textarea was not materialized');
    textarea.value = 'edited';
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(moduleInputValues).toEqual(['edited']);
    expect(leakedNativeInputs).toHaveLength(0);

    shell.remove();
    await flush();
    textarea.value = 'after-detach';
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(moduleInputValues).toEqual(['edited']);
  });
});
