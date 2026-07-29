export default {
  type: 'demo',
  root: {
    kind: 'box',
    className: 'flex gap-5',
    children: [
      {
        kind: 'proto',
        prototypeId: 'brutalist-scroll-area-root',
        className: 'h-48 w-80',
        children: [
          {
            kind: 'proto',
            prototypeId: 'brutalist-scroll-area-viewport',
            children: [
              {
                kind: 'box',
                className: 'flex flex-col gap-2 p-3',
                children: [
                  { kind: 'box', children: ['Scrollable conversation content.'] },
                  { kind: 'box', children: ['Row 2'] },
                  { kind: 'box', children: ['Row 3'] },
                  { kind: 'box', children: ['Row 4'] },
                  { kind: 'box', children: ['Row 5'] },
                  { kind: 'box', children: ['Row 6'] },
                  { kind: 'box', children: ['Row 7'] },
                  { kind: 'box', children: ['Row 8'] },
                  { kind: 'box', children: ['Row 9'] },
                  { kind: 'box', children: ['Row 10'] },
                  { kind: 'box', children: ['Row 11'] },
                  { kind: 'box', children: ['Row 12'] },
                  { kind: 'box', children: ['Row 13'] },
                  { kind: 'box', children: ['Row 14'] },
                  { kind: 'box', children: ['Row 15'] },
                ],
              },
            ],
          },
          {
            kind: 'proto',
            prototypeId: 'brutalist-scroll-area-scrollbar',
            props: { orientation: 'vertical' },
            children: [{ kind: 'proto', prototypeId: 'brutalist-scroll-area-thumb' }],
          },
        ],
      },
    ],
  },
};
