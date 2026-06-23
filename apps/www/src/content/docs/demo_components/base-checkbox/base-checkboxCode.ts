import { formatCode } from '@/utils/conversionUtils';
import type { RuntimeId } from '@/components/PrototypePreviewer/runtimes/registry';

export const codeMap: Record<RuntimeId, Record<string, string>> = {
  wc: {
    'demo-base-checkbox_table': formatCode(`
<div class="flex w-full max-w-2xl flex-col gap-3">
  <div class="text-sm font-semibold text-slate-800">Controlled table selection (checkedChange)</div>
  <div class="text-xs text-slate-500">Selected: 1 / 4</div>
  <div class="flex w-full flex-col">    <div class="w-full overflow-hidden rounded-lg border border-slate-200">
      <div class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
        <div class="flex items-center justify-center px-2 py-2">
          <wc-base-checkbox-root>
            <wc-base-checkbox-indicator>
              <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
              <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
            </wc-base-checkbox-indicator>
          </wc-base-checkbox-root>
        </div>
        <div class="px-3 py-2">Name</div>
        <div class="px-3 py-2">Email</div>
        <div class="px-3 py-2">Role</div>
      </div>
      <div class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
        <div class="flex items-center justify-center px-2 py-2">
          <wc-base-checkbox-root checked>
            <wc-base-checkbox-indicator>
              <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
              <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
            </wc-base-checkbox-indicator>
          </wc-base-checkbox-root>
        </div>
        <div class="px-3 py-2 font-medium">Sarah Chen</div>
        <div class="px-3 py-2">sarah.chen@example.com</div>
        <div class="px-3 py-2">Admin</div>
      </div>
      <div class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
        <div class="flex items-center justify-center px-2 py-2">
          <wc-base-checkbox-root>
            <wc-base-checkbox-indicator>
              <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
              <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
            </wc-base-checkbox-indicator>
          </wc-base-checkbox-root>
        </div>
        <div class="px-3 py-2 font-medium">Marcus Rodriguez</div>
        <div class="px-3 py-2">marcus.rodriguez@example.com</div>
        <div class="px-3 py-2">User</div>
      </div>
      <div class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
        <div class="flex items-center justify-center px-2 py-2">
          <wc-base-checkbox-root>
            <wc-base-checkbox-indicator>
              <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
              <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
            </wc-base-checkbox-indicator>
          </wc-base-checkbox-root>
        </div>
        <div class="px-3 py-2 font-medium">Priya Patel</div>
        <div class="px-3 py-2">priya.patel@example.com</div>
        <div class="px-3 py-2">User</div>
      </div>
      <div class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
        <div class="flex items-center justify-center px-2 py-2">
          <wc-base-checkbox-root>
            <wc-base-checkbox-indicator>
              <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
              <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
            </wc-base-checkbox-indicator>
          </wc-base-checkbox-root>
        </div>
        <div class="px-3 py-2 font-medium">David Kim</div>
        <div class="px-3 py-2">david.kim@example.com</div>
        <div class="px-3 py-2">Editor</div>
      </div>
    </div></div>
</div>
    `),
    'demo-base-checkbox': formatCode(`
<div class="flex flex-col items-start gap-3">
  <wc-base-checkbox-root>
    <wc-base-checkbox-indicator>
      <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
      <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
    </wc-base-checkbox-indicator>
    <div class="flex flex-col gap-0.5">
Unchecked
      <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
    </div>
  </wc-base-checkbox-root>
  <wc-base-checkbox-root default-checked>
    <wc-base-checkbox-indicator>
      <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
      <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
    </wc-base-checkbox-indicator>
    <div class="flex flex-col gap-0.5">
Checked
      <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
    </div>
  </wc-base-checkbox-root>
  <wc-base-checkbox-root default-indeterminate>
    <wc-base-checkbox-indicator>
      <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
      <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
    </wc-base-checkbox-indicator>
    <div class="flex flex-col gap-0.5">
Indeterminate
      <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
    </div>
  </wc-base-checkbox-root>
  <wc-base-checkbox-root disabled>
    <wc-base-checkbox-indicator>
      <div class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
      <div class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
    </wc-base-checkbox-indicator>
    <div class="flex flex-col gap-0.5">
Disabled
      <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
    </div>
  </wc-base-checkbox-root>
</div>
    `),
  },
  react: {
    'demo-base-checkbox_table': formatCode(`
import { BaseCheckboxIndicator, BaseCheckboxRoot } from '@prototype-libs/base';

export function DemoBaseCheckboxTableDemo() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="text-sm font-semibold text-slate-800">
        Controlled table selection (checkedChange)
      </div>
      <div className="text-xs text-slate-500">Selected: 1 / 4</div>
      <div className="flex w-full flex-col">
        <div className="w-full overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500">
            <div className="flex items-center justify-center px-2 py-2">
              <BaseCheckboxRoot checked={false} indeterminate={false}>
                <BaseCheckboxIndicator>
                  <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
                  <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
                </BaseCheckboxIndicator>
              </BaseCheckboxRoot>
            </div>
            <div className="px-3 py-2">Name</div>
            <div className="px-3 py-2">Email</div>
            <div className="px-3 py-2">Role</div>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-center px-2 py-2">
              <BaseCheckboxRoot checked>
                <BaseCheckboxIndicator>
                  <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
                  <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
                </BaseCheckboxIndicator>
              </BaseCheckboxRoot>
            </div>
            <div className="px-3 py-2 font-medium">Sarah Chen</div>
            <div className="px-3 py-2">sarah.chen@example.com</div>
            <div className="px-3 py-2">Admin</div>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-center px-2 py-2">
              <BaseCheckboxRoot checked={false}>
                <BaseCheckboxIndicator>
                  <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
                  <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
                </BaseCheckboxIndicator>
              </BaseCheckboxRoot>
            </div>
            <div className="px-3 py-2 font-medium">Marcus Rodriguez</div>
            <div className="px-3 py-2">marcus.rodriguez@example.com</div>
            <div className="px-3 py-2">User</div>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-center px-2 py-2">
              <BaseCheckboxRoot checked={false}>
                <BaseCheckboxIndicator>
                  <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
                  <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
                </BaseCheckboxIndicator>
              </BaseCheckboxRoot>
            </div>
            <div className="px-3 py-2 font-medium">Priya Patel</div>
            <div className="px-3 py-2">priya.patel@example.com</div>
            <div className="px-3 py-2">User</div>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0">
            <div className="flex items-center justify-center px-2 py-2">
              <BaseCheckboxRoot checked={false}>
                <BaseCheckboxIndicator>
                  <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
                  <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
                </BaseCheckboxIndicator>
              </BaseCheckboxRoot>
            </div>
            <div className="px-3 py-2 font-medium">David Kim</div>
            <div className="px-3 py-2">david.kim@example.com</div>
            <div className="px-3 py-2">Editor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `),
    'demo-base-checkbox': formatCode(`
import { BaseCheckboxIndicator, BaseCheckboxRoot } from '@prototype-libs/base';

export function DemoBaseCheckboxDemo() {
  return (
    <div className="flex flex-col items-start gap-3">
      <BaseCheckboxRoot>
        <BaseCheckboxIndicator>
          <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
          <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
        </BaseCheckboxIndicator>
        <div className="flex flex-col gap-0.5">
          Unchecked
          <div className="text-xs text-slate-500">checked: false, indeterminate: false</div>
        </div>
      </BaseCheckboxRoot>
      <BaseCheckboxRoot defaultChecked>
        <BaseCheckboxIndicator>
          <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
          <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
        </BaseCheckboxIndicator>
        <div className="flex flex-col gap-0.5">
          Checked<div className="text-xs text-slate-500">checked: false, indeterminate: false</div>
        </div>
      </BaseCheckboxRoot>
      <BaseCheckboxRoot defaultIndeterminate>
        <BaseCheckboxIndicator>
          <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
          <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
        </BaseCheckboxIndicator>
        <div className="flex flex-col gap-0.5">
          Indeterminate
          <div className="text-xs text-slate-500">checked: false, indeterminate: false</div>
        </div>
      </BaseCheckboxRoot>
      <BaseCheckboxRoot disabled>
        <BaseCheckboxIndicator>
          <div className="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"></div>
          <div className="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"></div>
        </BaseCheckboxIndicator>
        <div className="flex flex-col gap-0.5">
          Disabled<div className="text-xs text-slate-500">checked: false, indeterminate: false</div>
        </div>
      </BaseCheckboxRoot>
    </div>
  );
}
    `),
  },
  vue: {
    'demo-base-checkbox_table': formatCode(`
<script setup lang="ts">
import { BaseCheckboxIndicator, BaseCheckboxRoot } from '@prototype-libs/base';
</script>

<template>
  <div class="flex w-full max-w-2xl flex-col gap-3">
    <div class="text-sm font-semibold text-slate-800">
      Controlled table selection (checkedChange)
    </div>
    <div class="text-xs text-slate-500">Selected: 1 / 4</div>
    <div class="flex w-full flex-col">
      <div class="w-full overflow-hidden rounded-lg border border-slate-200">
        <div
          class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500"
        >
          <div class="flex items-center justify-center px-2 py-2">
            <BaseCheckboxRoot checked="false" indeterminate="false">
              <BaseCheckboxIndicator>
                <div
                  class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
                ></div>
                <div
                  class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
                ></div>
              </BaseCheckboxIndicator>
            </BaseCheckboxRoot>
          </div>
          <div class="px-3 py-2">Name</div>
          <div class="px-3 py-2">Email</div>
          <div class="px-3 py-2">Role</div>
        </div>
        <div
          class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0"
        >
          <div class="flex items-center justify-center px-2 py-2">
            <BaseCheckboxRoot checked>
              <BaseCheckboxIndicator>
                <div
                  class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
                ></div>
                <div
                  class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
                ></div>
              </BaseCheckboxIndicator>
            </BaseCheckboxRoot>
          </div>
          <div class="px-3 py-2 font-medium">Sarah Chen</div>
          <div class="px-3 py-2">sarah.chen@example.com</div>
          <div class="px-3 py-2">Admin</div>
        </div>
        <div
          class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0"
        >
          <div class="flex items-center justify-center px-2 py-2">
            <BaseCheckboxRoot checked="false">
              <BaseCheckboxIndicator>
                <div
                  class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
                ></div>
                <div
                  class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
                ></div>
              </BaseCheckboxIndicator>
            </BaseCheckboxRoot>
          </div>
          <div class="px-3 py-2 font-medium">Marcus Rodriguez</div>
          <div class="px-3 py-2">marcus.rodriguez@example.com</div>
          <div class="px-3 py-2">User</div>
        </div>
        <div
          class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0"
        >
          <div class="flex items-center justify-center px-2 py-2">
            <BaseCheckboxRoot checked="false">
              <BaseCheckboxIndicator>
                <div
                  class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
                ></div>
                <div
                  class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
                ></div>
              </BaseCheckboxIndicator>
            </BaseCheckboxRoot>
          </div>
          <div class="px-3 py-2 font-medium">Priya Patel</div>
          <div class="px-3 py-2">priya.patel@example.com</div>
          <div class="px-3 py-2">User</div>
        </div>
        <div
          class="grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0"
        >
          <div class="flex items-center justify-center px-2 py-2">
            <BaseCheckboxRoot checked="false">
              <BaseCheckboxIndicator>
                <div
                  class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
                ></div>
                <div
                  class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
                ></div>
              </BaseCheckboxIndicator>
            </BaseCheckboxRoot>
          </div>
          <div class="px-3 py-2 font-medium">David Kim</div>
          <div class="px-3 py-2">david.kim@example.com</div>
          <div class="px-3 py-2">Editor</div>
        </div>
      </div>
    </div>
  </div>
</template>
    `),
    'demo-base-checkbox': formatCode(`
<script setup lang="ts">
import { BaseCheckboxIndicator, BaseCheckboxRoot } from '@prototype-libs/base';
</script>

<template>
  <div class="flex flex-col items-start gap-3">
    <BaseCheckboxRoot>
      <BaseCheckboxIndicator>
        <div
          class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
        ></div>
        <div
          class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
        ></div>
      </BaseCheckboxIndicator>
      <div class="flex flex-col gap-0.5">
        Unchecked
        <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
      </div>
    </BaseCheckboxRoot>
    <BaseCheckboxRoot defaultChecked>
      <BaseCheckboxIndicator>
        <div
          class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
        ></div>
        <div
          class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
        ></div>
      </BaseCheckboxIndicator>
      <div class="flex flex-col gap-0.5">
        Checked
        <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
      </div>
    </BaseCheckboxRoot>
    <BaseCheckboxRoot defaultIndeterminate>
      <BaseCheckboxIndicator>
        <div
          class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
        ></div>
        <div
          class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
        ></div>
      </BaseCheckboxIndicator>
      <div class="flex flex-col gap-0.5">
        Indeterminate
        <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
      </div>
    </BaseCheckboxRoot>
    <BaseCheckboxRoot disabled>
      <BaseCheckboxIndicator>
        <div
          class="h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100"
        ></div>
        <div
          class="absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100"
        ></div>
      </BaseCheckboxIndicator>
      <div class="flex flex-col gap-0.5">
        Disabled
        <div class="text-xs text-slate-500">checked: false, indeterminate: false</div>
      </div>
    </BaseCheckboxRoot>
  </div>
</template>
    `),
  },
};
