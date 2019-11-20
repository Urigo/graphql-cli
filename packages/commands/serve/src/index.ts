import { CliPlugin } from '@test-graphql-cli/common';
import open from 'open';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import { ApolloServer, PlaygroundConfig, addMockFunctionsToSchema, IMocks } from 'apollo-server';

const ServeExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  api.loaders.schema.register(new GitLoader());
  api.loaders.schema.register(new GithubLoader());

  return {
    name: 'serve',
  };
};

export type MockConfig = { [typeName: string]: string };
export type ServeConfig = { mocks: MockConfig; playground: PlaygroundConfig; } ;

export async function loadMocks(mockConfig?: MockConfig) {
  if(!mockConfig) {
    return {};
  }
  const mocks: IMocks = {};
  const mocksLoad$: Promise<void>[] = [];
  for (const typeName in mockConfig) {
    const [ moduleName, importName ] = mockConfig[typeName];
    mocksLoad$.push(
      import(moduleName).then(
        mod => mocks[typeName] = mod[importName]
      )
    )
  }
  await Promise.all(mocksLoad$);
  return mocks;
}

export const plugin: CliPlugin = {
  init({ program, reportError, loadConfig }) {
    program
      .command('serve [port]')
      .action(async (port: string | number = '4000') => {
        try {

          const config = await loadConfig({
            extensions: [ServeExtension]
          });

          const serveConfig: ServeConfig = await config.extension('serve');

          const [ schema, mocks ] = await Promise.all([
            config.getSchema(),
            serveConfig.mocks && loadMocks(serveConfig.mocks)
          ]);

          addMockFunctionsToSchema({
            schema,
            mocks,
          });

          const apolloServer = new ApolloServer({
            ...serveConfig,
            schema,
            mocks: false,
          });

          await apolloServer.listen(port)
          
          const url = `http://localhost:${port}/graphql`;
          console.log(`Serving the GraphQL API and Playground on ${url}`);
          await open(url);

        } catch (e) {
          reportError(e);
        }
      });
  }
};
