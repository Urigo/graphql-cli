#!/usr/bin/env node

import { installCommands } from './index';
import * as chalk from 'chalk';

installCommands()
  .demandCommand()
  .help()
  .completion('completion')
  .usage(`Usage: ${chalk.green('graphql')} [command]`)
  .example('graphql init', 'interactively init .graphqlconfig file')
  .example('graphql get-schema dev', 'download schema from "dev" endpoint and save to local file')
  .example('graphql ping dev', 'send simple GraphQL query to "dev" endpoint')
  .example('graphql diff dev prod', 'show schema diff between "dev" and "prod" endpoints')
  .example('graphql diff dev', 'show schema diff between "dev" and local saved schema')
  .epilogue('for more information, check out https://github.com/graphcool/graphcool-cli')
  .argv
