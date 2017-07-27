import * as chalk from 'chalk'

export const command = 'playground [endpointName]'
export const desc = `${chalk.red('[not implemented]')} Open ready-to-use GraphQL Playground in your browser`

import { Context, noEndpointError } from '../'

export async function handler (context: Context, argv: {endpointName: string}) {
  throw new Error('This command is not implemented yet')
}
