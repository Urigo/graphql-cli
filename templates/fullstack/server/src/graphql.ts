
import { join } from 'path';
import { loadSchemaFiles } from '@graphql-toolkit/file-loading';
import { ApolloServer, PubSub } from 'apollo-server-express';
import { buildSchema } from 'graphql';
import { createKnexPGCRUDRuntimeServices } from "@graphback/runtime-knex"
import { createDB } from './db'
import { models } from './resolvers/models';
import resolvers from './resolvers/resolvers'

/**
 * Creates Apollo server
 */
export const createApolloServer = async () => {
    const db = await createDB();
    const pubSub = new PubSub();

    const typeDefs = loadSchemaFiles(join(__dirname, '/schema/')).join('\n')
    const schema = buildSchema(typeDefs);
    const context = createKnexPGCRUDRuntimeServices(models, schema, db, pubSub);
    const apolloServer = new ApolloServer({
        typeDefs: typeDefs,
        resolvers,
        context,
        playground: true,
    })

    return apolloServer;
}
