export const command = 'query <file>'
export const describe = 'Run query/mutation'

import chalk from 'chalk'
import * as fs from 'fs'
import { Argv } from 'yargs'
import fetch from 'node-fetch'
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
  all: {
    alias: 'a',
    describe: 'Run all operations in order',
    type: 'boolean',
  },
}

export async function handler(
  context: Context,
  argv: { file: string; operation: string; endpoint: string; all: boolean },
) {
  const config = context.getProjectConfig()
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
      await runQuery(query, operationName, endpoint)
    }
  } else if (argv.operation) {
    await runQuery(query, argv.operation, endpoint)
  } else {
    const { selectedOperationNames } = await context.prompt({
      type: 'checkbox',
      name: 'selectedOperationNames',
      message: 'Select operation to run',
      choices: operationNames,
    })

    for (const operationName of selectedOperationNames) {
      await runQuery(query, operationName, endpoint)
    }
  }
}

async function runQuery(
  query: string,
  operationName: string,
  endpoint: GraphQLEndpoint,
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
    }),
  })

  const result = await response.json()

  try {
    console.log(JSON.stringify(result, null, 2))
  } catch (e) {
    console.log(JSON.parse(result))
  }
}
