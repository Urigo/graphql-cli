export const command = 'schema-status'
export const desc = 'Show source & timestamp of local schema'

import * as _ from 'lodash'
import chalk from 'chalk'
import { relative } from 'path'
import { existsSync, fstatSync } from 'fs'
import { getSchemaExtensions } from 'graphql-config'
import { Context } from '../'

export async function handler (context: Context) {
  const schemaPath = context.getProjectConfig().schemaPath as string
  const relativeSchemaPath = relative(process.cwd(), schemaPath)

  if (!existsSync(schemaPath)) {
    console.log(
      chalk.yellow('Schema file doesn\'t exist at ') +
      chalk.blue(relativeSchemaPath),
    )
    return
  }

  const extensions = {
    schemaPath: relativeSchemaPath,
    ...getSchemaExtensions(schemaPath),
  }
  const maxLength = _(extensions).keys().map('length').max()

  for (let name in extensions) {
    const padName = _.padStart(name, maxLength)
    console.log(`${padName}\t${chalk.blue(extensions[name])}`)
  }

  if (Object.keys(extensions).length === 0) {
    return
  }
}
