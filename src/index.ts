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
import { patchEndpointsToConfig as patchGraphcoolEndpointsToConfig } from 'graphql-config-extension-graphcool'
import { patchEndpointsToConfig as patchPrismaEndpointsToConfig } from 'graphql-config-extension-prisma'
import { patchEndpointsToConfig as patchOpenApiEndpointsToConfig } from 'tmp-graphql-config-extension-openapi'
import {
  getGraphQLProjectConfig,
  GraphQLProjectConfig,
  GraphQLConfig,
  getGraphQLConfig,
  ConfigNotFoundError,
  resolveEnvsInValues,
} from 'graphql-config'
// import * as updateNotifier from 'update-notifier'
// const pkg = require('../package.json')
import 'source-map-support/register'

export * from './types'
export * from './utils'

// updateNotifier({ pkg }).notify()

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
  const processedCommands = {}
  for (const moduleName of ['./cmds', ...plugins]) {
    try {
      const cmdModule = require(moduleName)
      const cmdModules = Array.isArray(cmdModule) ? cmdModule : [cmdModule]
      for (const cmd of cmdModules) {
        const commandName = cmd.command.split(' ')[0]
        if (!processedCommands[commandName]) {
          yargs = yargs.command(wrapCommand(cmd))
          processedCommands[commandName] = moduleName
        }
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
        let config: GraphQLProjectConfig | undefined
        while (!config) {
          try {
            config = argv['project']
              ? getGraphQLProjectConfig(process.cwd(), argv['project'])
              : (getGraphQLProjectConfig(process.cwd()) as GraphQLProjectConfig)

            config.config = resolveEnvsInValues(config.config, process.env)
            config = await patchGraphcoolEndpointsToConfig(
              config,
              process.cwd(),
            )
            config = await patchPrismaEndpointsToConfig(config, process.cwd())
            config = await patchOpenApiEndpointsToConfig(config)
          } catch (error) {
            const config: GraphQLConfig = getGraphQLConfig(process.cwd())
            const projectNames = Object.keys(config.getProjects() || {})
            if (projectNames) {
              if (error.message.includes('multiproject')) {
                console.log(chalk.yellow('No project name specified'))
              } else if (error.message.includes('not a valid project name')) {
                console.log(chalk.yellow('Invalid project name specified'))
              }
              const { projectName } = await inquirer.prompt<{
                projectName: string
              }>({
                type: 'list',
                name: 'projectName',
                choices: projectNames,
                message: 'Select a project:',
              })
              argv['project'] = projectName
            } else {
              throw error
            }
          }
        }
        return config
      },
      async getConfig() {
        let config = getGraphQLConfig(process.cwd())
        config.config = resolveEnvsInValues(config.config, process.env)
        config = await patchGraphcoolEndpointsToConfig(config)
        config = await patchPrismaEndpointsToConfig(config)
        config = await patchOpenApiEndpointsToConfig(config)
        return config
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
      if (process.env.DEBUG === '*') {
        if (e.stack) {
          console.log(e.stack)
        } else {
          console.log(e)
        }
      } else {
        console.log(chalk.red(e.message))
      }

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
