export const command = 'lint'
export const desc = 'Check schema for linting errors'

import * as chalk from 'chalk'
import { Context } from '../'
import { runner } from 'graphql-schema-linter'

export async function handler (context: Context) {
  const config = context.getProjectConfig()

  const exitCode = runner.run(
    process.stdout,
    process.stdin,
    process.stderr,
    ['', '', config['config']['schemaPath']],
  )

  if (exitCode !== 0) {
    throw new Error('Linting errors were found')
  }
}
