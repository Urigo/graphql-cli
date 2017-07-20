export const command = 'get-schema [endpointName]'
export const desc = 'Download GraphQL schema'

import { existsSync } from 'fs'
import { relative } from 'path'
import { writeSchema } from 'graphql-config'

export async function handler(context, argv) {
  const config = context.getConfig()
  const endpoint = config.endpointExtension.getEndpoint(argv.endpointName)
  console.log(`Downloading introspection from ${endpoint.url}`)

  const schema = await endpoint.resolveSchema(argv.endpointName)
  const schemaPath = relative(process.cwd(), config.schemaPath)
  await writeSchema(config.schemaPath, schema)
  const existed = existsSync(schemaPath)
  console.log(`Schema file was ${existed ? 'updated' : 'created'} ${schemaPath}`)
}
