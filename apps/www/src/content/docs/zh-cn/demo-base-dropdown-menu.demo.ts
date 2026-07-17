export default {
  type: 'demo',
  root: {
    kind: 'proto',
    prototypeId: 'base-dropdown-root',
    children: [
      {
        kind: 'proto',
        prototypeId: 'base-dropdown-trigger',
        className: 'inline-flex rounded border px-3 py-2 text-sm font-medium',
        children: ['Base actions'],
      },
      {
        kind: 'proto',
        prototypeId: 'base-dropdown-content',
        props: { align: 'start' },
        className: 'min-w-44 rounded border bg-white p-1 text-sm shadow-md',
        children: [
          {
            kind: 'proto',
            prototypeId: 'base-dropdown-item',
            props: { value: 'profile', textValue: 'Profile' },
            className: 'block w-full rounded px-2 py-1.5 text-left',
            children: ['Profile'],
          },
          {
            kind: 'proto',
            prototypeId: 'base-dropdown-item',
            props: { value: 'billing', textValue: 'Billing' },
            className: 'block w-full rounded px-2 py-1.5 text-left',
            children: ['Billing'],
          },
          {
            kind: 'proto',
            prototypeId: 'base-dropdown-item',
            props: { value: 'team', textValue: 'Team', disabled: true },
            className: 'block w-full rounded px-2 py-1.5 text-left opacity-50',
            children: ['Team (disabled, focusable)'],
          },
        ],
      },
    ],
  },
};
