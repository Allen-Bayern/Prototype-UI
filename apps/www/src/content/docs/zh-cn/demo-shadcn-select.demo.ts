export default {
  type: 'demo',
  root: {
    kind: 'proto',
    prototypeId: 'shadcn-select-root',
    children: [
      {
        kind: 'proto',
        prototypeId: 'shadcn-select-trigger',
        className: 'w-56',
        children: [
          {
            kind: 'proto',
            prototypeId: 'shadcn-select-value',
            props: { placeholder: 'Select an adapter' },
          },
        ],
      },
      {
        kind: 'proto',
        prototypeId: 'shadcn-select-content',
        props: { position: 'popper', align: 'start' },
        children: [
          {
            kind: 'proto',
            prototypeId: 'shadcn-select-item',
            props: { value: 'react', textValue: 'React' },
            children: ['React'],
          },
          {
            kind: 'proto',
            prototypeId: 'shadcn-select-item',
            props: { value: 'vue', textValue: 'Vue' },
            children: ['Vue'],
          },
          {
            kind: 'proto',
            prototypeId: 'shadcn-select-item',
            props: { value: 'wc', textValue: 'Web Components' },
            children: ['Web Components'],
          },
          {
            kind: 'proto',
            prototypeId: 'shadcn-select-item',
            props: { value: 'solid', textValue: 'Solid', disabled: true },
            children: ['Solid (Soon)'],
          },
        ],
      },
    ],
  },
};
