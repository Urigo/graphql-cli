import chalk from 'chalk'
import * as crypto from 'crypto'
import * as express from 'express'
import * as requestProxy from 'express-request-proxy'
import * as fs from 'fs'
import expressPlayground from 'graphql-playground-middleware-express'
import * as opn from 'opn'
import * as os from 'os'
import * as path from 'path'

import { Context, noEndpointError } from '../'

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
  serverOnly: {
    describe: 'Run only server',
    type: 'boolean',
    'default': 'false'
  }
}

function randomString(len = 32) {
  return crypto
    .randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len)
    .replace(/\+/g, '0')
    .replace(/\//g, '0')
}

export async function handler(
  context: Context,
  argv: { endpoint: string; port: string; web: boolean, serverOnly: boolean },
) {
  const localPlaygroundPath = `/Applications/GraphQL\ Playground.app/Contents/MacOS/GraphQL\ Playground`
  if (fs.existsSync(localPlaygroundPath) && !argv.web) {
    const envPath = path.join(os.tmpdir(), `${randomString()}.json`)
    fs.writeFileSync(envPath, JSON.stringify(process.env))
    const url = `graphql-playground://?cwd=${process.cwd()}&envPath=${envPath}`
    opn(url, { wait: false })
  } else {
    const app = express()

    const config = await context.getConfig()
    const projects = config.getProjects()

    if (projects === undefined) {
      const projectConfig = await context.getProjectConfig()
      if (!projectConfig.endpointsExtension) {
        throw noEndpointError
      }
      const endpoint = projectConfig.endpointsExtension.getEndpoint(
        argv.endpoint,
      )

      app.use(
        '/graphql',
        requestProxy({
          url: endpoint.url,
          headers: endpoint.headers,
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

    const port = argv.port || 3000

    const listener = app.listen(port, () => {
      let host = listener.address().address
      if (host === '::') {
        host = 'localhost'
      }
      const link = `http://${host}:${port}/playground`
      console.log('Serving playground at %s', chalk.blue(link))
      if (!argv.serverOnly) {
        opn(link)
      }
    })
  }
}
