import { describe, expect, it } from 'vitest';
import { definePrototype, type DefHandle, type TextControlPatch } from '@proto.ui/core';
import { asTextControl } from '@proto.ui/hooks';
import { declareTextControl } from '@proto.ui/module-text-control';
import { createVueAdapter } from '../src/adapt';
import { VueAny, createMountedVueAdapter, flushVue } from './utils/vue';

type ControlProps = { defaultValue?: string; placeholder?: string; rows?: number };

const textControlValues: string[] = [];
const textareaPrototype = definePrototype({
  name: 'vue-text-control',
  modules: [declareTextControl({ target: { namespace: 'web', localName: 'textarea' } })],
  setup(def: DefHandle<ControlProps>) {
    def.props.define({
      defaultValue: { type: 'string', empty: 'fallback' },
      placeholder: { type: 'string', empty: 'fallback' },
      rows: { type: 'number', empty: 'fallback' },
    });
    const control = asTextControl<ControlProps>();
    control.on('input', (_run, event) => textControlValues.push(event.value));
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

describe('adapter-vue text control', () => {
  it('materializes the declared textarea root, projects patches, and routes input', async () => {
    const mounted = createMountedVueAdapter(textareaPrototype, {
      defaultValue: 'initial',
      placeholder: 'Write',
      rows: 4,
    });
    await flushVue();
    const textarea = mounted.root as HTMLTextAreaElement;
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
    expect(textarea.value).toBe('initial');
    expect(textarea.defaultValue).toBe('initial');
    expect(textarea.placeholder).toBe('Write');
    expect(Number(textarea.rows)).toBe(4);

    textarea.value = 'edited';
    textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
    expect(textControlValues).toEqual(['edited']);
    mounted.unmount();
  });

  it('rejects a rootTag that conflicts with the static textarea declaration', () => {
    expect(() => createVueAdapter(VueAny)(textareaPrototype, { rootTag: 'div' })).toThrow(
      /rootTag/
    );
  });
});
