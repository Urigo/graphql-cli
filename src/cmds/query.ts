export const command = 'query <file>'
export const describe = 'Run query/mutation'

import * as fs from 'fs'
import * as fetch from 'node-fetch'
import { parse, OperationDefinitionNode } from 'graphql'
import { Context, noEndpointError } from '../'
import { GraphQLEndpoint } from 'graphql-config'

export const builder = {
  endpoint: {
    alias: 'e',
    describe: 'Endpoint name',
    type: 'string',
  },
  operation: {
    alias: 'o',
    describe: 'Operation name',
    type: 'string',
  },
  variables: {
    describe: 'GraphQL query variables as JSON string',
    type: 'string',
  },
  all: {
    alias: 'a',
    describe: 'Run all operations in order',
    type: 'boolean',
  },
}

export async function handler(
  context: Context,
  argv: {
    file: string
    operation: string
    endpoint: string
    all: boolean
    variables: string
  },
) {
  const config = await context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }

  const endpoint = config.endpointsExtension.getEndpoint(argv.endpoint)
  const query = fs.readFileSync(argv.file, { encoding: 'utf8' })

  const document = parse(query)
  const operationNames = document.definitions.map(
    (d: OperationDefinitionNode) => d.name!.value,
  )

  if (argv.all) {
    for (const operationName of operationNames) {
      await runQuery(query, operationName, endpoint, argv.variables)
    }
  } else if (argv.operation) {
    await runQuery(query, argv.operation, endpoint, argv.variables)
  } else {
    const { selectedOperationNames } = await context.prompt<{
      selectedOperationNames: string[]
    }>({
      type: 'checkbox',
      name: 'selectedOperationNames',
      message: 'Select operation to run',
      choices: operationNames,
    })

    for (const operationName of selectedOperationNames) {
      await runQuery(query, operationName, endpoint, argv.variables)
    }
  }
}

async function runQuery(
  query: string,
  operationName: string,
  endpoint: GraphQLEndpoint,
  variables: string,
): Promise<void> {
  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers: {
      ...endpoint.headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      operationName,
      variables: parseVariables(variables),
    }),
  })

  const result = await response.json()

  try {
    console.log(JSON.stringify(result, null, 2))
  } catch (e) {
    console.log(JSON.parse(result))
  }
}

function parseVariables(variables: string = '{}'): object {
  let obj = {}
  try {
    obj = JSON.parse(variables)
  } catch (e) {
    console.error(`There was a problem parsing your variables: ${variables}`)
    console.error(`Error: ${e}`)
    console.error('Passing empty variables instead.')
  }
  return obj
}
