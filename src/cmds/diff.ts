export const command = 'diff <from> [to]'
export const desc = 'Show a diff beetween GraphQL schemas of two endpoints'

import { relative } from 'path'
import {
  printSchema,
  findBreakingChanges,
} from 'graphql'
import * as disparity from 'disparity'

// FIXME: remove when https://github.com/graphql/graphql-js/pull/965 is merged
const { findDangerousChanges } = require('graphql/utilities/findBreakingChanges')

export async function handler(context, argv) {
  const config = context.getConfig()
  const from = config.endpointExtension.getEndpoint(argv.from)
  const fromDesc = `${argv.from} (${from.url})`
  const fromSchema = await from.resolveSchema()
  let toSchema
  let toDesc

  if (argv.to) {
    const to = config.endpointExtension.getEndpoint(argv.to);
    toDesc = `${argv.to} (${to.url})`
    toSchema = await to.resolveSchema()
  } else {
    toDesc = relative(process.cwd(), config.schemaPath)
    toSchema = config.getSchema()
  }

  const fromSDL = printSchema(fromSchema)
  const toSDL = printSchema(toSchema)
  if (fromSDL === toSDL) {
    // TODO: make green
    console.log('✔ No changes')
    return;
  }

  var diff = disparity.unified(fromSDL, toSDL, { paths: [fromDesc, toDesc] });
  console.log(diff);

  const dangerousChanges = findDangerousChanges(fromSchema, toSchema)
  if (dangerousChanges.length !== 0) {
    for (const change of dangerousChanges) {
      console.log('⚠️  ' + change.description)
    }
  }

  const breakingChanges = findBreakingChanges(fromSchema, toSchema)
  if (breakingChanges.length !== 0) {
    for (const change of breakingChanges) {
      console.log('✖ ' + change.description)
    }
  }
}
