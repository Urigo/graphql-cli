import { CliPlugin } from '@test-graphql-cli/common';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import open from 'open';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config/dist';
import { IMocks, addMockFunctionsToSchema } from '@kamilkisiela/graphql-tools';

const ServeExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader() as any);

  return {
    name: 'serve',
  };
};

export type MockConfig = { [typeName: string]: string };
export type MockFn<T = any> = () => T;
export type Mocks = { [typeName: string]: MockFn };
export type ServeConfig = { mocks: MockConfig } ;

export async function loadMocks(mockConfig?: MockConfig) {
  if(!mockConfig) {
    return true;
  }
  const mocks: Mocks = {};
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

          const app = express();

          app.use(graphqlHTTP(async () => {
            try {
              const config = await loadConfig({
                extensions: [ServeExtension]
              });

              const serveConfig: ServeConfig = await config.extension('serve');
  
              const [ schema, mocks ] = await Promise.all([
                config.getSchema(),
                serveConfig && loadMocks(serveConfig.mocks)
              ]);
  
              addMockFunctionsToSchema({
                schema,
                mocks: mocks as IMocks,
              });
  
              return {
                schema,
                graphiql: true,
              };
            } catch (e) {
              reportError(e);
            }

            return null;
          }))
          

          app.listen(port, () => {
            const url = `http://localhost:${port}/`;
            console.log(`Serving the GraphQL API on ${url}`);
            open(url);
          });

        } catch (e) {
          reportError(e);
        }
      });
  }
};
