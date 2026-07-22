import { formatCode } from '@/utils/conversionUtils';
import type { RuntimeId } from '@/components/PrototypePreviewer/runtimes/registry';

export const codeMap: Record<RuntimeId, Record<string, string>> = {
  wc: {
    'demo-shadcn-dialog': formatCode(`
<wc-shadcn-dialog-root id="profile-dialog" class="relative inline-flex items-start">
  <wc-shadcn-dialog-trigger>Open Dialog</wc-shadcn-dialog-trigger>
  <wc-shadcn-dialog-mask></wc-shadcn-dialog-mask>
  <wc-shadcn-dialog-content>
    <wc-shadcn-dialog-header>
      <wc-shadcn-dialog-title>Edit Profile</wc-shadcn-dialog-title>
      <wc-shadcn-dialog-description>
        Make changes to your profile here. Click save when you're done.
      </wc-shadcn-dialog-description>
    </wc-shadcn-dialog-header>
    <wc-shadcn-dialog-footer>
      <wc-shadcn-dialog-close>
        <wc-shadcn-button variant="outline">Cancel</wc-shadcn-button>
      </wc-shadcn-dialog-close>
      <wc-shadcn-button id="save-profile">Save changes</wc-shadcn-button>
    </wc-shadcn-dialog-footer>
  </wc-shadcn-dialog-content>
</wc-shadcn-dialog-root>

<script>
  const dialog = document.querySelector('#profile-dialog');
  document.querySelector('#save-profile')?.addEventListener('click', () => {
    dialog?.getExposes().close('save');
  });
</script>
    `),
  },
  react: {
    'demo-shadcn-dialog': formatCode(`
import { useRef, type ComponentRef } from 'react';
import {
  ShadcnButton,
  ShadcnDialogRoot,
  ShadcnDialogTrigger,
  ShadcnDialogMask,
  ShadcnDialogContent,
  ShadcnDialogHeader,
  ShadcnDialogFooter,
  ShadcnDialogTitle,
  ShadcnDialogDescription,
  ShadcnDialogClose,
} from '@prototype-libs/shadcn';

export function DemoShadcnDialogDemo() {
  const dialogRef = useRef<ComponentRef<typeof ShadcnDialogRoot>>(null);

  return (
    <ShadcnDialogRoot ref={dialogRef} className="relative inline-flex items-start">
      <ShadcnDialogTrigger>Open Dialog</ShadcnDialogTrigger>
      <ShadcnDialogMask />
      <ShadcnDialogContent>
        <ShadcnDialogHeader>
          <ShadcnDialogTitle>Edit Profile</ShadcnDialogTitle>
          <ShadcnDialogDescription>
            Make changes to your profile here. Click save when you're done.
          </ShadcnDialogDescription>
        </ShadcnDialogHeader>
        <ShadcnDialogFooter>
          <ShadcnDialogClose>
            <ShadcnButton variant="outline">Cancel</ShadcnButton>
          </ShadcnDialogClose>
          <ShadcnButton onClick={() => dialogRef.current?.getExposes().close('save')}>
            Save changes
          </ShadcnButton>
        </ShadcnDialogFooter>
      </ShadcnDialogContent>
    </ShadcnDialogRoot>
  );
}
    `),
  },
  vue: {
    'demo-shadcn-dialog': formatCode(`
<script setup lang="ts">
import { useTemplateRef } from 'vue';
import {
  ShadcnButton,
  ShadcnDialogRoot,
  ShadcnDialogTrigger,
  ShadcnDialogMask,
  ShadcnDialogContent,
  ShadcnDialogHeader,
  ShadcnDialogFooter,
  ShadcnDialogTitle,
  ShadcnDialogDescription,
  ShadcnDialogClose,
} from '@prototype-libs/shadcn';

const dialog = useTemplateRef<InstanceType<typeof ShadcnDialogRoot>>('dialog');

function save() {
  dialog.value?.getExposes().close('save');
}
</script>

<template>
  <ShadcnDialogRoot ref="dialog" class="relative inline-flex items-start">
    <ShadcnDialogTrigger>Open Dialog</ShadcnDialogTrigger>
    <ShadcnDialogMask />
    <ShadcnDialogContent>
      <ShadcnDialogHeader>
        <ShadcnDialogTitle>Edit Profile</ShadcnDialogTitle>
        <ShadcnDialogDescription>
          Make changes to your profile here. Click save when you're done.
        </ShadcnDialogDescription>
      </ShadcnDialogHeader>
      <ShadcnDialogFooter>
        <ShadcnDialogClose>
          <ShadcnButton variant="outline">Cancel</ShadcnButton>
        </ShadcnDialogClose>
        <ShadcnButton @click="save">Save changes</ShadcnButton>
      </ShadcnDialogFooter>
    </ShadcnDialogContent>
  </ShadcnDialogRoot>
</template>
    `),
  },
};
