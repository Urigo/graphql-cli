import chalk from 'chalk'
import * as fs from 'fs'

export const command = 'playground'
export const describe = 'Open interactive GraphQL Playground'
export const builder = {
  port: {
    alias: 'p',
    description: 'port to start local server with voyager on',
  },
  endpoint: {
    alias: 'e',
    describe: 'Endpoint name',
    type: 'string',
  },
}

import { Context, noEndpointError } from '../'
import * as express from 'express'
import expressPlayground from 'graphql-playground-middleware-express'
import * as requestProxy from 'express-request-proxy'
import fetch from 'node-fetch'
import * as opn from 'opn'

export async function handler(
  context: Context,
  argv: { endpoint: string; port: string },
) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }

  const localPlaygroundPath = `/Applications/GraphQL\ Playground.app/Contents/MacOS/GraphQL\ Playground`

  if (fs.existsSync(localPlaygroundPath)) {
    const url = `graphql-playground://?cwd=${process.cwd()}&env=${JSON.stringify(
      process.env,
    )}`
    opn(url)
  } else {
    const endpoint = config.endpointsExtension.getEndpoint(argv.endpoint)
    const app = express()

    app.use(
      '/graphql',
      requestProxy({
        url: endpoint.url,
        headers: endpoint.headers,
      }),
    )

    app.use('/playground', expressPlayground({ endpoint: '/graphql' } as any))

    const port = argv.port || 3000

    const listener = app.listen(port, () => {
      let host = listener.address().address
      if (host === '::') {
        host = 'localhost'
      }
      const link = `http://${host}:${port}/playground`
      console.log('Serving playground at %s', chalk.blue(link))
      opn(link)
    })
  }
}
