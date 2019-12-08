import cors from 'cors';
import express from 'express';
import http from 'http';

import graphqlHTTP from 'express-graphql'
import { execute, subscribe } from 'graphql';
import { loadConfig } from 'graphql-config';
import { makeExecutableSchema } from 'graphql-tools';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import { connect } from './db'
import { resolvers } from './resolvers';
import { typeDefs } from './schema';
import { pubsub } from './subscriptions';

async function start() {
  const app = express();

  app.use(cors());

  app.get('/health', (req, res) => res.sendStatus(200));

  const config = await loadConfig({
    extensions: [() => ({ name: 'generate'})]
  });

  const generateConfig = await config!.getDefault().extension('generate');

  // connect to db
  const db = await connect(generateConfig.db.dbConfig);

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  });

  app.use('/graphql', graphqlHTTP(
    (req) => ({
      schema,
      context: {
        req,
        db,
        pubsub
      },
      graphiql: process.env.NODE_ENV !== 'production',
    }),
  ));

  const server = http.createServer(app);

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe
    },
    {
      server,
      path: '/graphql'
    }
  );

  const port = process.env.PORT || 4000;
  server.listen({ port }, () => {
    console.log(`🚀  Server ready at http://localhost:${port}/graphql`)
  })
}

start().catch((err) => console.error(err));
