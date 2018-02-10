export interface Boilerplate {
  name: string
  description: string
  repo: string
}

export const defaultBoilerplates: Boilerplate[] = [
  {
    name: 'node-minimal',
    description: '"Hello World" GraphQL server',
    repo:
      'https://github.com/graphql-boilerplates/node-graphql-server/tree/master/minimal',
  },
  {
    name: 'node-basic',
    description: 'Basic GraphQL server (incl. database)',
    repo:
      'https://github.com/graphql-boilerplates/node-graphql-server/tree/master/basic',
  },
  {
    name: 'node-advanced',
    description: 'GraphQL server (incl. database & authentication)',
    repo:
      'https://github.com/graphql-boilerplates/node-graphql-server/tree/master/advanced',
  },
  {
    name: 'typescript-basic',
    description: 'Basic GraphQL server (incl. database)',
    repo:
      'https://github.com/graphql-boilerplates/typescript-graphql-server/tree/master/basic',
  },
  {
    name: 'typescript-advanced',
    description: 'GraphQL server (incl. database & authentication)',
    repo:
      'https://github.com/graphql-boilerplates/typescript-graphql-server/tree/master/advanced',
  },
  {
    name: 'react-fullstack-basic',
    description: 'React app + GraphQL server (incl. database )',
    repo:
      'https://github.com/graphql-boilerplates/react-fullstack-graphql/tree/master/basic',
  },
  {
    name: 'vue-fullstack-basic',
    description: 'Vue app + GraphQL server (incl. database )',
    repo:
      'https://github.com/graphql-boilerplates/vue-fullstack-graphql/tree/master/basic',
  },
]
