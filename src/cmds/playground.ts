import chalk from 'chalk'
import * as express from 'express'
import * as requestProxy from 'express-request-proxy'
import * as fs from 'fs'
import expressPlayground from 'graphql-playground-middleware-express'
import * as opn from 'opn'
import { AddressInfo } from 'net'

import { Context, noEndpointError, getTmpPath } from '../'

export const command = 'playground'
export const describe = 'Open interactive GraphQL Playground'
export const builder = {
  port: {
    description: 'port to start local server with voyager on',
  },
  endpoint: {
    alias: 'e',
    describe: 'Endpoint name',
    type: 'string',
  },
  web: {
    alias: 'w',
    describe: 'Open web version (even if desktop app available)',
    type: 'boolean',
  },
  'server-only': {
    describe: 'Run only server',
    type: 'boolean',
    default: false,
  },
}

const startServer = async ({
  context,
  endpoint,
  port = '3000',
}: {
  context: Context
  endpoint: string
  port: string
}) =>
  new Promise<string>(async (resolve, reject) => {
    const app = express()
    const config = await context.getConfig()
    const projects = config.getProjects()

    if (projects === undefined) {
      const projectConfig = await context.getProjectConfig()

      if (!projectConfig.endpointsExtension) {
        throw noEndpointError
      }
      const { url, headers } = projectConfig.endpointsExtension.getEndpoint(
        endpoint,
      )

      app.use(
        '/graphql',
        requestProxy({
          url,
          headers,
        }),
      )

      app.use(
        '/playground',
        expressPlayground({
          endpoint: '/graphql',
          config: config.config,
        }),
      )
    } else {
      app.use(
        '/playground',
        expressPlayground({ config: config.config } as any),
      )
    }

    const listener = app.listen(port, () => {
      let host = (listener.address() as AddressInfo).address
      if (host === '::') {
        host = 'localhost'
      }
      const link = `http://${host}:${port}/playground`
      console.log('Serving playground at %s', chalk.blue(link))

      resolve(link)
    })
  })

export async function handler(
  context: Context,
  argv: { endpoint: string; port: string; web: boolean; serverOnly: boolean },
) {
  const localPlaygroundPath = `/Applications/GraphQL\ Playground.app/Contents/MacOS/GraphQL\ Playground`

  const isLocalPlaygroundAvailable = fs.existsSync(localPlaygroundPath)

  const shouldStartServer =
    argv.serverOnly || argv.web || !isLocalPlaygroundAvailable

  const shouldOpenBrowser = !argv.serverOnly

  if (shouldStartServer) {
    const link = await startServer({
      context,
      endpoint: argv.endpoint,
      port: argv.port,
    })

    if (shouldOpenBrowser) {
      opn(link)
    }
  } else {
    const envPath = getTmpPath()
    fs.writeFileSync(envPath, JSON.stringify(process.env))
    const url = `graphql-playground://?cwd=${process.cwd()}&envPath=${envPath}`
    opn(url, { wait: false })
  }
}
