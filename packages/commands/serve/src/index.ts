import { defineCommand } from '@graphql-cli/common';
import { loaders } from '@graphql-cli/loaders';
import { addMocksToSchema, IMocks } from '@graphql-tools/mock';
import express from 'express';
import graphql from 'express-graphql';
import open from 'open';
import { GraphQLExtensionDeclaration } from 'graphql-config';

const ServeExtension: GraphQLExtensionDeclaration = (api) => {
  loaders.forEach((loader) => {
    api.loaders.schema.register(loader);
  });

  return {
    name: 'serve',
  };
};

export type MockConfig = { [typeName: string]: string };
export type ServeConfig = { mocks: MockConfig; graphiql?: boolean };

export async function loadMocks(mockConfig?: MockConfig) {
  if (!mockConfig) {
    return {};
  }

  const mocks: IMocks = {};
  const mocksLoad$: Promise<void>[] = [];
  
  for (const typeName in mockConfig) {
    const [moduleName, importName] = mockConfig[typeName];
    mocksLoad$.push(import(moduleName).then((mod) => (mocks[typeName] = mod[importName])));
  }
  
  await Promise.all(mocksLoad$);
  
  return mocks;
}

export default defineCommand<
  {},
  {
    project?: string;
    port: number;
  }
>(() => {
  return {
    command: 'serve [port]',
    builder(yargs) {
      return yargs
        .positional('port', {
          describe: 'Port number (default: 4000)',
          type: 'number',
          default: 4000,
        })
        .options({
          project: {
            alias: 'p',
            type: 'string'
          },
        }) as any;
    },
    async handler(args) {
      const graphqlConfig = await import('graphql-config');
      const config = await graphqlConfig.loadConfig({
        rootDir: process.cwd(),
        throwOnEmpty: true,
        throwOnMissing: true,
        extensions: [ServeExtension],
      });
      const projectNames = Object.keys(config.projects);
      if (args.project && !projectNames.includes(args.project)) {
        throw new Error(
          `You don't have project ${args.project} so you need to specify an available project name.\n` +
            `Available projects are; ${projectNames.join(',')}.`
        );
      }
      const project = config.getProject(args.project);

      const serveConfig: ServeConfig = await project.extension('serve');

      const [schema, mocks] = await Promise.all([
        project.getSchema(),
        serveConfig.mocks && loadMocks(serveConfig.mocks),
      ]);
      const hasMocks = Object.keys(mocks || {}).length;

      const server = express();

      server.use(
        '/graphql',
        graphql({
          schema: hasMocks ? addMocksToSchema({ schema, mocks }) : schema,
          graphiql: serveConfig.graphiql !== false,
        })
      );

      await new Promise((resolve) => {
        server.listen(args.port, resolve);
      });

      const url = `http://localhost:${args.port}/graphql`;

      console.info(`Serving the GraphQL API on ${url}`);

      await open(url);
    },
  };
});
