#!/usr/bin/env node


export type Context = typeof context
export * from './types';
export * from './utils';

import { join as joinPaths } from 'path'
import { existsSync, readdirSync } from 'fs'

import * as  _ from 'lodash'
import * as ora from 'ora'
import * as inquirer from 'inquirer'
import * as npmPaths from 'npm-paths'
import * as chalk from 'chalk'
import {
  getGraphQLProjectConfig,
  getGraphQLConfig,
  ConfigNotFoundError,
} from 'graphql-config'

import { CommandModule } from './types'

function listPluggings(dir:string): string[] {
  return readdirSync(dir)
    .filter(moduleName => moduleName.startsWith('graphql-cli-'))
    .map(moduleName => joinPaths(dir, moduleName))
}

export function installCommands() {
  const plugins = _(npmPaths())
    .filter(existsSync)
    .map(listPluggings)
    .flatten()
    .uniq()
    .value() as string[]

  let yargs = require('yargs')
  for (const moduleName of ['./cmds', ...plugins]) {
    try {
      const cmdModule:CommandModule = require(moduleName)
      if (Array.isArray(cmdModule)) {
        for (const cmd of cmdModule) {
          yargs = yargs.command(wrapCommand(cmd))
        }
      } else {
        yargs = yargs.command(wrapCommand(cmdModule))
      }
    } catch(e) {
      console.log(`Can't load ${moduleName} plugin:` + e.stack)
    }
  }
  return yargs
}

function wrapCommand(commandObject:CommandModule) {
  const originalHandler = commandObject.handler
  commandObject.handler = argv => {
    let result = new Promise((resolve, reject) => {
      try {
        resolve(originalHandler(context, argv))
      } catch(e) {
        reject(e)
      }
    })

    result.catch(e => {
      if (context.spinner['enabled']) {
        context.spinner.stopAndPersist()
      }
      //TODO: add debug flag for calltrace
      console.log(chalk.red(e.message));

      if (e instanceof ConfigNotFoundError) {
        console.log(chalk.yellow(`\nRun ${chalk.green('graphql init')} to create new .graphqlconfig`))
      }
      //FIXME: set non-zero exit code
    })
  }
  return commandObject
}

const context = {
  prompt: inquirer.createPromptModule(),
  spinner: ora(),
  getProjectConfig() {
    return getGraphQLProjectConfig()
  },
  getConfig() {
    return getGraphQLConfig()
  }
}

// Mutation calls "graphql mutation addUser --id 1 --name Test"
// Execute static .graphql files
