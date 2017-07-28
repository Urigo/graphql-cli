#!/usr/bin/env node

import { installCommands } from './index';
import * as chalk from 'chalk';

let showedHelp = false

installCommands()
  .demandCommand(1, 1, 'Missing command name')
  .strict()
  .help()
  .completion('completion')
  .usage(`Usage: ${chalk.green('graphql')} [command]`)
  .example('graphql init', 'interactively init .graphqlconfig file')
  .example('graphql get-schema dev', 'download schema from "dev" endpoint and save to local file')
  .example('graphql ping dev', 'send simple GraphQL query to "dev" endpoint')
  .example('graphql diff dev prod', 'show schema diff between "dev" and "prod" endpoints')
  .example('graphql diff dev', 'show schema diff between "dev" and local saved schema')
  .epilogue('for more information, check out https://github.com/graphcool/graphcool-cli')
  .fail(function (msg, err, yargs) {
    if (err) throw err // preserve stack
    if (!showedHelp) {
      yargs.showHelp()
      showedHelp = true
    }
    console.error(chalk.red(msg))
  })
  .argv
