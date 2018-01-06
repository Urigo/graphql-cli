import { join as joinPaths } from 'path'
import { existsSync, readdirSync } from 'fs'
import { CommandObject, Context } from './types'
import { CommandModule } from 'yargs'
import * as _ from 'lodash'
import * as ora from 'ora'
import * as inquirer from 'inquirer'
import * as npmPaths from 'npm-paths'
import * as dotenv from 'dotenv'
import chalk from 'chalk'
import { patchEndpointsToConfig } from 'graphql-config-extension-graphcool'
import {
  getGraphQLProjectConfig,
  GraphQLProjectConfig,
  GraphQLConfig,
  getGraphQLConfig,
  ConfigNotFoundError,
} from 'graphql-config'

export * from './types'
export * from './utils'

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
    } catch (e) {
      console.log(`Can't load ${moduleName} plugin:` + e.stack)
    }
  }
  return yargs
}

function wrapCommand(commandObject: CommandObject): CommandModule {
  const originalHandler = commandObject.handler
  commandObject.handler = argv => {
    // load env vars from .env file
    const envPath = argv['dotenv'] || '.env'
    dotenv.config({ path: envPath })

    // prepare context object
    const context: Context = {
      prompt: inquirer.createPromptModule(),
      spinner: ora(),
      async getProjectConfig() {
        const config: GraphQLProjectConfig = argv['project']
          ? getGraphQLProjectConfig(process.cwd(), argv['project'])
          : getGraphQLProjectConfig(process.cwd())

        return patchEndpointsToConfig(config, process.cwd())
      },
      async getConfig() {
        const config: GraphQLConfig = getGraphQLConfig(process.cwd())
        return patchEndpointsToConfig(config)
      },
    }

    let result = new Promise((resolve, reject) => {
      try {
        resolve(originalHandler(context, argv))
      } catch (e) {
        reject(e)
      }
    })

    result.catch(e => {
      if (context.spinner['enabled']) {
        context.spinner.fail()
      }
      // TODO: add debug flag for calltrace
      console.log(chalk.red(e.message))

      if (e instanceof ConfigNotFoundError) {
        console.log(
          chalk.yellow(
            `\nRun ${chalk.green('graphql init')} to create new .graphqlconfig`,
          ),
        )
      }

      process.exitCode = 1
    })
  }
  return commandObject as CommandModule
}

// Mutation calls "graphql mutation addUser --id 1 --name Test"
// Execute static .graphql files
