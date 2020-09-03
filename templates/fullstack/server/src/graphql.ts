import { join } from 'path';
import { loadFiles } from '@graphql-tools/load-files';
import { ApolloServer } from 'apollo-server-express';
import { buildGraphbackAPI } from 'graphback';
import { createKnexDbProvider } from '@graphback/runtime-knex';
import { migrateDB, removeNonSafeOperationsFilter } from 'graphql-migrations';
import { createDB, getConfig } from './db';
import { SchemaCRUDPlugin } from '@graphback/codegen-schema';

/**
 * Creates Apollo server
 */
export const createApolloServer = async () => {
  const db = await createDB();
  const dbConfig = await getConfig();

  const schema = (await loadFiles(join(__dirname, '../../model/'))).join('\n');
  const { resolvers, contextCreator, typeDefs} = buildGraphbackAPI(schema, {
    dataProviderCreator: createKnexDbProvider(db),
    plugins: [new SchemaCRUDPlugin({
      outputPath: "./src/schema/schema.graphql"
    })]
  });

  migrateDB(dbConfig, typeDefs, {
    operationFilter: removeNonSafeOperationsFilter
  }).then(() => {
    console.log("Migrated database");
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: contextCreator,
    playground: true,
  });

  return apolloServer;
};
