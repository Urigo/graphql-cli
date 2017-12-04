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
  web: {
    alias: 'w',
    describe: 'Open web version (even if desktop app available)',
    type: 'boolean',
  },
}

import { Context, noEndpointError } from '../'
import * as express from 'express'
import expressPlayground from 'graphql-playground-middleware-express'
import * as requestProxy from 'express-request-proxy'
import fetch from 'node-fetch'
import * as opn from 'opn'
import { getUsedEnvs } from 'graphql-config'

export async function handler(
  context: Context,
  argv: { endpoint: string; port: string, web: boolean },
) {
  const localPlaygroundPath = `/Applications/GraphQL\ Playground.app/Contents/MacOS/GraphQL\ Playground`

  if (fs.existsSync(localPlaygroundPath) && !argv.web) {
    const config = context.getConfig().config
    const usedEnvVars = getUsedEnvs(config)
    const url = `graphql-playground://?cwd=${process.cwd()}&env=${JSON.stringify(usedEnvVars)}`
    opn(url, { wait: false })
  } else {
    const app = express()

    const config = context.getConfig()
    const projects = config.getProjects()

    if (projects === undefined) {
      const projectConfig = context.getProjectConfig()
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

      app.use('/playground', expressPlayground({ endpoint: '/graphql' } as any))
    } else {
      app.use(
        '/playground',
        expressPlayground({ folderName: process.cwd() } as any),
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
      opn(link)
    })
  }
}
