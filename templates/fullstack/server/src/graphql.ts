import { join } from 'path';
import { loadFiles } from '@graphql-tools/load-files';
import { ApolloServer, PubSub } from 'apollo-server-express';
import { buildSchema } from 'graphql';
import { createKnexPGCRUDRuntimeServices } from '@graphback/runtime-knex';
import { createDB } from './db';
import { models } from './resolvers/models';
import resolvers from './resolvers/resolvers';

/**
 * Creates Apollo server
 */
export const createApolloServer = async () => {
  const db = await createDB();
  const pubSub = new PubSub();

  const typeDefs = (await loadFiles(join(__dirname, '/schema/'))).join('\n');
  const schema = buildSchema(typeDefs);
  const context = createKnexPGCRUDRuntimeServices(models, schema, db, pubSub);
  const apolloServer = new ApolloServer({
    typeDefs: typeDefs,
    resolvers,
    context,
    playground: true,
  });

  return apolloServer;
};
