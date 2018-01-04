export const command = 'lint'
export const describe = 'Check schema for linting errors'

import { Context } from '../'
import { runner } from 'graphql-schema-linter'

export async function handler(context: Context) {
  const { schemaPath } = await context.getProjectConfig()

  const exitCode = runner.run(process.stdout, process.stdin, process.stderr, [
    '',
    '',
    schemaPath,
  ])

  if (exitCode !== 0) {
    throw new Error('Linting errors were found')
  }
}
