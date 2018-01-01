export const command = 'diff'
export const describe = 'Show a diff between two schemas'

import { relative } from 'path'
import chalk from 'chalk'
import {
  printSchema,
  findBreakingChanges,
} from 'graphql'
import * as disparity from 'disparity'

import { Context, noEndpointError } from '../'

// FIXME: remove when https://github.com/graphql/graphql-js/pull/965 is merged
const { findDangerousChanges } = require('graphql/utilities/findBreakingChanges')

export const builder = yargs => {
  yargs
    .alias('e', 'endpoint')
    .describe('e', 'Endpoint name')
    .string('e')
    .alias('t', 'target')
    .describe('t', 'Target endpoint name')
    .string('t')
    .example('graphql diff -e dev -t prod', 'show schema diff between "dev" and "prod" endpoints')
    .example('graphql diff -e dev', 'show schema diff between "dev" and local saved schema')
}

export async function handler (context: Context, argv: {endpoint: string, target: string}) {
  const config = await context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }

  const endpoint = config.endpointsExtension.getEndpoint(argv.endpoint)
  const fromDesc = `${argv.endpoint} (${endpoint.url})`
  const fromSchema = await endpoint.resolveSchema()
  let toSchema
  let toDesc

  if (argv.target) {
    const target = config.endpointsExtension.getEndpoint(argv.target)
    toDesc = `${argv.target} (${target.url})`
    toSchema = await target.resolveSchema()
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
