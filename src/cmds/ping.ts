export const command = 'ping [endpointName]'
export const desc = 'Ping GraphQL endpoint'

export async function handler(context, argv) {
  const config = context.getConfig()
  const endpoint = config.endpointExtension.getEndpoint(argv.endpointName)
  const testQuery = '{ __typename }'
  console.log(`Sending ${testQuery} query to ${endpoint.url}`)

  const result = await endpoint.getClient().request(testQuery)
  if (typeof result.__typename !== 'string') {
    throw Error(`Unexpected query result: ${JSON.stringify(result, null, 2)}`)
  }
  console.log('Call succeeded!')
}
