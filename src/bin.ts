#!/usr/bin/env node

import { installCommands } from './index';
import * as chalk from 'chalk';

let showedHelp = false

installCommands()
  .demandCommand(1, 1, 'Missing command name')
  .strict()
  .help()
  .completion('completion', false)
  .env('GRAPHQL')
  .usage(`Usage: ${chalk.green('graphql')} [command]`)
  .example('graphql init', 'Interactively setup .graphqlconfig file')
  .example('graphql get-schema dev', 'Update local schema to match "dev" endpoint')
  .example('graphql diff dev prod', 'Show schema diff between "dev" and "prod" endpoints')
  .epilogue([
    'All options can be passed as environment variables',
    'e.g. GRAPHQL_WATCH=true is equivalent to --watch=true',
    '',
    'For more information go to https://github.com/graphcool/graphql-cli'
  ].join('\n'))
  .fail((msg, err, yargs) => {
    if (err) throw err // preserve stack
    if (!showedHelp) {
      yargs.showHelp()
      showedHelp = true
    }
    if (msg !== 'Missing command name') {
      console.error(chalk.red(msg))
    }
  })
  .argv
