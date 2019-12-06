import express from 'express'
import { PubSub } from 'graphql-subscriptions'
import knex from 'knex'

export interface GraphQLContext {
  pubsub: PubSub
  req: express.Request
  db: knex<any, unknown[]>
}
