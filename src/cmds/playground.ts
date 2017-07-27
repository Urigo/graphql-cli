import * as chalk from 'chalk'

export const command = 'playground [endpointName]'
export const desc = `${chalk.red('[not implemented]')} Open ready-to-use GraphQL Playground in your browser`
export const builder = {
  port: {
    alias: 'p',
    description: 'port to start local server with voyager on',
  }
}

import { Context, noEndpointError } from '../'
import * as express from 'express';
import { express as middleware } from 'graphql-playground/middleware'
import  * as requestProxy from 'express-request-proxy'
import { fetch } from 'node-fetch'
import * as opn from 'opn'

export async function handler (context: Context, argv: {endpointName: string, port: string}) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }

  const endpoint = config.endpointsExtension.getEndpoint(argv.endpointName);
  const app = express();

  app.use('/graphql', requestProxy({
    url: endpoint.url,
    headers: endpoint.headers
  }));

  app.use('/playground', middleware({ endpointUrl: '/graphql' }));

  const port = argv.port || 3000;

  const listener = app.listen(port, () => {
    let host = listener.address().address
    if (host === '::') {
      host = 'localhost'
    }
    const link = `http://${host}:${port}/playground`
    console.log('Serving playground at %s', chalk.blue(link))
    opn(link)
  });
}
