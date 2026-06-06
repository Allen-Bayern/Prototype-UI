import type { DemoSetupContext } from '../../../../components/PrototypePreviewer/demo-types';

const indicatorClass =
  'group relative grid h-5 w-5 place-items-center rounded-[4px] border border-slate-400 text-white ' +
  'data-[checked]:border-blue-600 data-[checked]:bg-blue-600 ' +
  'data-[indeterminate]:border-blue-600 data-[indeterminate]:bg-blue-600';

const checkMark = {
  kind: 'box',
  className: 'h-2.5 w-2.5 rounded-sm bg-current opacity-0 group-data-[checked]:opacity-100',
};

const indeterminateMark = {
  kind: 'box',
  className:
    'absolute h-0.5 w-2.5 rounded bg-current opacity-0 group-data-[indeterminate]:opacity-100',
};

const tableData = [
  { id: '1', name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'Admin' },
  { id: '2', name: 'Marcus Rodriguez', email: 'marcus.rodriguez@example.com', role: 'User' },
  { id: '3', name: 'Priya Patel', email: 'priya.patel@example.com', role: 'User' },
  { id: '4', name: 'David Kim', email: 'david.kim@example.com', role: 'Editor' },
] as const;

function checkboxIndicator() {
  return {
    kind: 'proto',
    prototypeId: 'base-checkbox-indicator',
    className: indicatorClass,
    children: [checkMark, indeterminateMark],
  };
}

function tableCheckbox(ref: string, props?: Record<string, unknown>) {
  return {
    kind: 'proto',
    prototypeId: 'base-checkbox-root',
    ref,
    className:
      'inline-flex cursor-pointer select-none items-center justify-center rounded-md p-1 ' +
      'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
    props,
    children: [checkboxIndicator()],
  };
}

function tableCell(content: string, className?: string) {
  return {
    kind: 'box',
    className: className ?? 'px-3 py-2 text-sm text-slate-700',
    children: [content],
  };
}

export default {
  type: 'demo',
  root: {
    kind: 'box',
    className: 'flex w-full max-w-2xl flex-col gap-3',
    children: [
      {
        kind: 'box',
        className: 'text-sm font-semibold text-slate-800',
        children: ['Controlled table selection (checkedChange)'],
      },
      {
        kind: 'box',
        ref: 'table-selection-status',
        className: 'text-xs text-slate-500',
        children: ['Selected: 1 / 4'],
      },
      {
        kind: 'box',
        ref: 'checkbox-group',
        className: 'flex w-full flex-col',
        children: [
          {
            kind: 'box',
            className: 'w-full overflow-hidden rounded-lg border border-slate-200',
            children: [
              {
                kind: 'box',
                className:
                  'grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-200 bg-slate-50 text-left text-xs font-medium text-slate-500',
                children: [
                  {
                    kind: 'box',
                    className: 'flex items-center justify-center px-2 py-2',
                    children: [
                      tableCheckbox('select-all', { checked: false, indeterminate: false }),
                    ],
                  },
                  tableCell('Name', 'px-3 py-2'),
                  tableCell('Email', 'px-3 py-2'),
                  tableCell('Role', 'px-3 py-2'),
                ],
              },
              ...tableData.map((row) => ({
                kind: 'box',
                ref: `table-row-${row.id}`,
                className:
                  'grid grid-cols-[2.5rem_1fr_1.4fr_5rem] border-b border-slate-100 last:border-b-0',
                children: [
                  {
                    kind: 'box',
                    className: 'flex items-center justify-center px-2 py-2',
                    children: [
                      tableCheckbox(`row-${row.id}`, {
                        checked: row.id === '1',
                      }),
                    ],
                  },
                  tableCell(row.name, 'px-3 py-2 font-medium'),
                  tableCell(row.email, 'px-3 py-2'),
                  tableCell(row.role, 'px-3 py-2'),
                ],
              })),
            ],
          },
        ],
      },
    ],
  },
  setup({ refs, api }: DemoSetupContext) {
    const cleanups: Array<() => void> = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    let selectedRows = new Set<string>(['1']);

    const syncTableSelection = () => {
      const count = selectedRows.size;
      const selectAll = count === tableData.length;
      const partial = count > 0 && !selectAll;

      api.setProps('select-all', {
        checked: selectAll,
        indeterminate: partial,
      });

      for (const row of tableData) {
        api.setProps(`row-${row.id}`, {
          checked: selectedRows.has(row.id),
        });
        const rowEl = refs[`table-row-${row.id}`];
        if (rowEl) {
          rowEl.dataset.state = selectedRows.has(row.id) ? 'selected' : '';
        }
      }

      const status = refs['table-selection-status'];
      if (status) {
        status.textContent = `Selected: ${count} / ${tableData.length}`;
      }
    };

    const onSelectAllCheckedChange = (event: Event) => {
      const detail = (event as CustomEvent<{ checked: boolean; indeterminate: boolean }>).detail;
      if (detail.checked) {
        selectedRows = new Set(tableData.map((row) => row.id));
      } else {
        selectedRows = new Set();
      }
      syncTableSelection();
    };

    const onRowCheckedChange = (rowId: string) => (event: Event) => {
      const detail = (event as CustomEvent<{ checked: boolean; indeterminate: boolean }>).detail;
      const next = new Set(selectedRows);
      if (detail.checked) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      selectedRows = next;
      syncTableSelection();
    };

    const bindTableSelection = () => {
      const selectAllRoot = refs['select-all'];
      if (!selectAllRoot) return false;

      selectAllRoot.addEventListener('checkedChange', onSelectAllCheckedChange);
      cleanups.push(() =>
        selectAllRoot.removeEventListener('checkedChange', onSelectAllCheckedChange)
      );

      for (const row of tableData) {
        const rowRoot = refs[`row-${row.id}`];
        if (!rowRoot) continue;
        const handler = onRowCheckedChange(row.id);
        rowRoot.addEventListener('checkedChange', handler);
        cleanups.push(() => rowRoot.removeEventListener('checkedChange', handler));
      }

      syncTableSelection();
      return true;
    };

    const bindTable = (attempt = 0) => {
      if (bindTableSelection() || attempt >= 6) return;
      const timer = setTimeout(() => bindTable(attempt + 1), 50 * (attempt + 1));
      timers.push(timer);
    };

    requestAnimationFrame(() => requestAnimationFrame(() => bindTable()));

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      cleanups.forEach((cleanup) => cleanup());
    };
  },
};
