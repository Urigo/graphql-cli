export interface Boilerplate {
  name: string
  description: string
  repo: string
}

// TODO implement the following
// * node-minimal
// * node-minimal-fullstack
// * node-basic
// * node-basic-fullstack
// * node-advanced
// * node-advanced-fullstack
// * typescript-minimal
// * typescript-minimal-fullstack
// * typescript-basic
// * typescript-basic-fullstack
// * typescript-advanced
// * typescript-advanced-fullstack

export const defaultBoilerplates: Boilerplate[] = [
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
      'https://github.com/graphql-boilerplates/react-fullstack-graphql/tree/master/apollo-client/basic',
  },
  {
    name: 'react-native-fullstack-basic',
    description: 'React Native app + GraphQL server (incl. database )',
    repo:
      'https://github.com/graphql-boilerplates/react-native-graphql/tree/master/apollo-client/basic',
  },
]
