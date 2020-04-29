export const models = [
  {
    name: 'Note',
    pubSub: {
      publishCreate: true,
      publishUpdate: true,
      publishDelete: true,
    },
  },
  {
    name: 'Comment',
    pubSub: {
      publishCreate: true,
      publishUpdate: true,
      publishDelete: true,
    },
  },
];
