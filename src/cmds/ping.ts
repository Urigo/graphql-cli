export const command = 'ping [endpointName]'
export const desc = 'Ping GraphQL endpoint'

import chalk from 'chalk'
import { Context, noEndpointError } from '../'

export async function handler (context: Context, argv: {endpointName: string}) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }
  const endpoint = config.endpointsExtension.getEndpoint(argv.endpointName)
  const testQuery = '{ __typename }'
  console.log(`Sending ${chalk.yellow(testQuery)} query to ${endpoint.url}`)

  const result = await endpoint.getClient().request<any>(testQuery)
  if (typeof result.__typename !== 'string') {
    throw Error(`Unexpected query result: ${JSON.stringify(result, null, 2)}`)
  }
  console.log(chalk.green('✔ Call succeeded!'))
}
