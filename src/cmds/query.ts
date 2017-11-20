export const command = 'query <file>'
export const describe = 'Run query/mutation'

import chalk from 'chalk'
import * as fs from 'fs'
import { Argv } from 'yargs'
import fetch from 'node-fetch'
import { parse, OperationDefinitionNode } from 'graphql'
import { Context, noEndpointError } from '../'

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
}

export async function handler (context: Context, argv: { file: string, operation: string, endpoint: string }) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }

  const endpoint = config.endpointsExtension.getEndpoint(argv.endpoint)
  const query = fs.readFileSync(argv.file, { encoding: 'utf8' })

  const document = parse(query)

  let operationName = argv.operation

  if (document.definitions.length > 1 && !operationName) {
    const operationNames = document.definitions.map((d: OperationDefinitionNode) => d.name!)
    operationName = (await context.prompt({
      type: 'list',
      name: 'operationName',
      message: 'Select operation to run',
      choices: operationNames,
    })).operationName
  }

  const response = await fetch(endpoint.url, {
    method: 'POST',
    headers: {
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
