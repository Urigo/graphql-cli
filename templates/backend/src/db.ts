import { loadConfig } from 'graphql-config'
import knex from 'knex'

export async function connect(options: knex.MySqlConnectionConfig) {
  const config = await loadConfig({
    extensions: [() => ({ name: 'generate'})]
  });
  const { db } = await config!.getDefault().extension('generate');
  return knex({
    client: db.database,
    connection: options
  })
}
