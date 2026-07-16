export default {
  type: 'demo',
  root: {
    kind: 'proto',
    prototypeId: 'base-hover-card-root',
    className: 'relative inline-flex items-start',
    props: { openDelay: 150, closeDelay: 300 },
    children: [
      {
        kind: 'proto',
        prototypeId: 'base-hover-card-trigger',
        className: 'cursor-pointer rounded border px-3 py-1.5 underline-offset-4',
        children: ['Hover me'],
      },
      {
        kind: 'proto',
        prototypeId: 'base-hover-card-content',
        className: 'w-72 rounded border bg-white p-3 shadow',
        props: { side: 'bottom', align: 'center' },
        children: [
          {
            kind: 'box',
            className: 'font-medium mb-1',
            children: ['Base Hover Card'],
          },
          'Pointer and focus intent open this preview after a short delay. Move into the card to keep it open.',
        ],
      },
    ],
  },
};
