import { CliPlugin } from '@graphql-cli/common';
import open from 'open';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import { ApolloServer, PlaygroundConfig as GraphQLPlaygroundConfig, IMocks } from 'apollo-server';
import { RenderPageOptions } from '@apollographql/graphql-playground-html';

const ServeExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  api.loaders.schema.register(new GitLoader());
  api.loaders.schema.register(new GithubLoader());
  api.loaders.schema.register(new ApolloEngineLoader());
  api.loaders.schema.register(new PrismaLoader());

  return {
    name: 'serve',
  };
};

export type PlaygroundConfig = GraphQLPlaygroundConfig & {
  tabs: { [name: string]: RenderPageOptions['tabs'][0] };
}

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
  init({ program, loadProjectConfig, reportError }) {
    program
      .command('serve [port]')
      .action(async (port: string | number = '4000') => {
        try {

          const config = await loadProjectConfig({
            extensions: [ServeExtension]
          });

          const serveConfig: ServeConfig = await config.extension('serve');

          const [ schema, mocks ] = await Promise.all([
            config.getSchema(),
            serveConfig.mocks && loadMocks(serveConfig.mocks)
          ]);

          let playground: GraphQLPlaygroundConfig = true;
          if (serveConfig.playground && serveConfig.playground.tabs) {
            const normalizedPlaygroundConfig: any = {};
            if (typeof serveConfig.playground === 'object') {
              Object.assign(normalizedPlaygroundConfig, serveConfig.playground);
            }
            const normalizedTabs = [];
            for (const tabName in serveConfig.playground.tabs) {
              normalizedTabs.push({
                name: tabName,
                ...serveConfig.playground.tabs[tabName]
              });
            }
            normalizedPlaygroundConfig.tabs = normalizedTabs;
            playground = normalizedPlaygroundConfig;
          }

          const apolloServer = new ApolloServer({
            schema,
            mocks,
            playground,
          });

          const serverInfo = await apolloServer.listen(port)
          
          const url = `http://localhost:${port}/graphql`;
          console.info(`Serving the GraphQL API and Playground on ${url}`);
          console.info(JSON.stringify(serverInfo, null, 2));
          await open(url);

        } catch (e) {
          reportError(e);
        }
      });
  }
};
