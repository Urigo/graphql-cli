#!/usr/bin/env node

import { installCommands } from './index'
import chalk from 'chalk'

let showedHelp = false

installCommands()
  .demandCommand(1, 1, 'Missing command name')
  .strict()
  .help()
  .completion('completion', false)
  .usage(`Usage: ${chalk.green('graphql')} [command]`)
  .example('graphql init', 'Interactively setup .graphqlconfig file')
  .example(
    'graphql get-schema -e dev',
    'Update local schema to match "dev" endpoint',
  )
  .example(
    'graphql diff -e dev -t prod',
    'Show schema diff between "dev" and "prod" endpoints',
  )
  .describe('dotenv', 'Path to .env file')
  .string('dotenv')
  .alias('p', 'project')
  .describe('p', 'Project name')
  .string('p')
  .alias('h', 'help')
  .alias('v', 'version')
  .epilogue(
    'For more information go to https://github.com/graphql-cli/graphql-cli',
  )
  .fail((msg, err, yargs) => {
    if (err) throw err // preserve stack
    if (!showedHelp) {
      yargs.showHelp()
      showedHelp = true
    }
    if (msg !== 'Missing command name') {
      console.error(chalk.red(msg))
    }
    // tslint:disable-next-line
  }).argv
