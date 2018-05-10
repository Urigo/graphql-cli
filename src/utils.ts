import chalk from 'chalk'
import * as crypto from 'crypto'
import * as path from 'path'
import * as os from 'os'

export const noEndpointError = new Error(
  `You don't have any endpoint in your .graphqlconfig.
Run ${chalk.yellow('graphql add-endpoint')} to add an endpoint to your config`,
)

function randomString(len = 32) {
  return crypto
    .randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len)
    .replace(/\+/g, '0')
    .replace(/\//g, '0')
}

export function getTmpPath() {
  return path.join(os.tmpdir(), `${randomString()}.json`)
}
