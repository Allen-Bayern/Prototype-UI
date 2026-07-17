export default {
  type: 'demo',
  root: {
    kind: 'proto',
    prototypeId: 'shadcn-dropdown-root',
    children: [
      {
        kind: 'proto',
        prototypeId: 'shadcn-dropdown-trigger',
        children: ['Actions'],
      },
      {
        kind: 'proto',
        prototypeId: 'shadcn-dropdown-content',
        props: { align: 'start' },
        children: [
          {
            kind: 'proto',
            prototypeId: 'shadcn-dropdown-item',
            props: { value: 'profile', textValue: 'Profile' },
            children: ['Profile'],
          },
          {
            kind: 'proto',
            prototypeId: 'shadcn-dropdown-item',
            props: { value: 'billing', textValue: 'Billing' },
            children: ['Billing'],
          },
          {
            kind: 'proto',
            prototypeId: 'shadcn-dropdown-item',
            props: { value: 'team', textValue: 'Team', disabled: true },
            children: ['Team (Soon)'],
          },
        ],
      },
    ],
  },
};
