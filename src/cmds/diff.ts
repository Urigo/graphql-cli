export const command = 'diff <from> [to]'
export const desc = 'Show a diff between two schemas'
export const builder = yargs => {
  yargs
    .example('graphql diff dev prod', 'show schema diff between "dev" and "prod" endpoints')
    .example('graphql diff dev', 'show schema diff between "dev" and local saved schema')
}

import { relative } from 'path'
import chalk from 'chalk';
import {
  printSchema,
  findBreakingChanges,
} from 'graphql'
import * as disparity from 'disparity'

import { Context, noEndpointError } from '../'

// FIXME: remove when https://github.com/graphql/graphql-js/pull/965 is merged
const { findDangerousChanges } = require('graphql/utilities/findBreakingChanges')

export async function handler (context: Context, argv: {from: string, to: string}) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }

  const from = config.endpointsExtension.getEndpoint(argv.from)
  const fromDesc = `${argv.from} (${from.url})`
  const fromSchema = await from.resolveSchema()
  let toSchema
  let toDesc

  if (argv.to) {
    const to = config.endpointsExtension.getEndpoint(argv.to)
    toDesc = `${argv.to} (${to.url})`
    toSchema = await to.resolveSchema()
  } else {
    toDesc = relative(process.cwd(), config.schemaPath as string)
    toSchema = config.getSchema()
  }

  const fromSDL = printSchema(fromSchema)
  const toSDL = printSchema(toSchema)
  if (fromSDL === toSDL) {
    console.log(chalk.green('✔ No changes'))
    return
  }

  let diff = disparity.unified(fromSDL, toSDL, { paths: [fromDesc, toDesc] })
  console.log(diff)

  const dangerousChanges = findDangerousChanges(fromSchema, toSchema)
  if (dangerousChanges.length !== 0) {
    console.log(chalk.yellow('Dangerous changes:'))
    for (const change of dangerousChanges) {
      console.log(chalk.yellow('  ⚠ ' + change.description))
    }
  }

  const breakingChanges = findBreakingChanges(fromSchema, toSchema)
  if (breakingChanges.length !== 0) {
    console.log(chalk.red('BREAKING CHANGES:'))
    for (const change of breakingChanges) {
      console.log(chalk.red('  ✖ ' + change.description))
    }
  }
}
