export const command = 'diff <from> [to]'
export const desc = 'Show a diff between GraphQL schemas of two endpoints'

import { relative } from 'path'
import * as chalk from 'chalk';
import {
  printSchema,
  findBreakingChanges,
} from 'graphql'
import * as disparity from 'disparity'

import { Context, noEndpointErrorMessage } from '../'

// FIXME: remove when https://github.com/graphql/graphql-js/pull/965 is merged
const { findDangerousChanges } = require('graphql/utilities/findBreakingChanges')

export async function handler(context:Context, argv: {from :string, to: string}) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw new Error(noEndpointErrorMessage)
  }

  const from = config.endpointsExtension.getEndpoint(argv.from)
  const fromDesc = `${argv.from} (${from.url})`
  const fromSchema = await from.resolveSchema()
  let toSchema
  let toDesc

  if (argv.to) {
    const to = config.endpointsExtension.getEndpoint(argv.to);
    toDesc = `${argv.to} (${to.url})`
    toSchema = await to.resolveSchema()
  } else {
    toDesc = relative(process.cwd(), config.schemaPath as string)
    toSchema = config.getSchema()
  }

  const fromSDL = printSchema(fromSchema)
  const toSDL = printSchema(toSchema)
  if (fromSDL === toSDL) {
    console.log(chalk.red('✔ No changes'))
    return
  }

  var diff = disparity.unified(fromSDL, toSDL, { paths: [fromDesc, toDesc] });
  console.log(diff)

  const dangerousChanges = findDangerousChanges(fromSchema, toSchema)
  if (dangerousChanges.length !== 0) {
    for (const change of dangerousChanges) {
      console.log(chalk.yellow('⚠ '+ change.description))
    }
  }

  const breakingChanges = findBreakingChanges(fromSchema, toSchema)
  if (breakingChanges.length !== 0) {
    for (const change of breakingChanges) {
      console.log(chalk.red('✖ ' + change.description))
    }
  }
}
