export * from './types'
export * from './utils'

import { join as joinPaths } from 'path'
import { existsSync, readdirSync } from 'fs'

import { CommandObject } from './types'
import { CommandModule, Argv } from 'yargs'
import * as _ from 'lodash'
import * as ora from 'ora'
import * as inquirer from 'inquirer'
import * as npmPaths from 'npm-paths'
import chalk from 'chalk'
import {
  getGraphQLProjectConfig,
  getGraphQLConfig,
  ConfigNotFoundError,
} from 'graphql-config'

function listPluggings(dir: string): string[] {
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
      const cmdModule = require(moduleName)
      const cmdModules = Array.isArray(cmdModule) ? cmdModule : [cmdModule]
      for (const cmd of cmdModules) {
        yargs = yargs.command(wrapCommand(cmd))
      }
    } catch(e) {
      console.log(`Can't load ${moduleName} plugin:` + e.stack)
    }
  }
  return yargs
}

function wrapCommand(commandObject: CommandObject): CommandModule {
  const originalHandler = commandObject.handler
  commandObject.handler = argv => {

    const context = {
      prompt: inquirer.createPromptModule(),
      spinner: ora(),
      getProjectConfig() {
        if (argv['project']) {
          return getGraphQLProjectConfig(process.cwd(), argv['project'])
        } else {
          return getGraphQLProjectConfig()
        }
      },
      getConfig() {
        return getGraphQLConfig()
      }
    }

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
      // TODO: add debug flag for calltrace
      console.log(chalk.red(e.message))

      if (e instanceof ConfigNotFoundError) {
        console.log(chalk.yellow(`\nRun ${chalk.green('graphql init')} to create new .graphqlconfig`))
      }
      // FIXME: set non-zero exit code
    })
  }
  return commandObject as CommandModule
}


// Mutation calls "graphql mutation addUser --id 1 --name Test"
// Execute static .graphql files
