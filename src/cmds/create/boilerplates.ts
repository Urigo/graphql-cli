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
      'https://github.com/graphql-boilerplates/node-graphql-server/tree/master/advanced
    ',
  },
  {
    name: 'typescript-minimal',
    description: 'Minimal GraphQL server ("Hello world")',
    repo:
      'https://github.com/graphql-boilerplates/typescript-graphql-server/tree/master/minimal',
  },
  {
    name: 'typescript-basic',
    description: 'Basic GraphQL server (incl. database)',
    repo:
      'https://github.com/graphql-boilerplates/typescript-graphql-server/tree/master/basic',
  },
]
