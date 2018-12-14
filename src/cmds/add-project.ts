export const command = 'add-project'
export const desc = 'Add new project to .graphqlconfig'

import chalk from 'chalk'
import { addEndpoint } from './init'
import { merge, has } from 'lodash'
import { Context } from '../'
import { GraphQLResolvedConfigData } from 'graphql-config'
import { dirname } from 'path'
import { existsSync } from 'fs'
import * as yaml from 'js-yaml'

export async function handler(context: Context) {
  const { prompt, getConfig } = context
  let newConfig: any = { projects: {} }

  const config = await getConfig()
  if (config.config.schemaPath && !config.config.projects) {
    console.log(chalk.yellow('Your existing config does not use projects.'))
    const { existingProjectName }: { [key: string]: string } = await prompt<{}>(
      {
        type: 'input',
        name: 'existingProjectName',
        message: 'Enter project name for existing configuration:',
      },
    )

    newConfig = {
      projects: {
        [existingProjectName]: config.config,
      },
    }
  } else {
    newConfig = config.config
  }

  const { projectName }: { [key: string]: string } = await prompt<{}>({
    type: 'input',
    name: 'projectName',
    message: 'Enter project name for new project:',
    validate: answer => {
      if (answer) {
        if (config.getProjects() && has(config.getProjects(), answer)) {
          return chalk.red('Project name already in use!')
        }
        return true
      }
      return false
    },
  })

  merge(newConfig, { projects: { [projectName]: {} } })

  let projectConfig: GraphQLResolvedConfigData = (await prompt({
    type: 'input',
    name: 'schemaPath',
    message: `Local schema file path:`,
    default: 'schema.graphql',
    validate(schemaPath) {
      const parentDir = dirname(schemaPath)
      if (!existsSync(parentDir)) {
        return `Parent dir doesn't exists: ${parentDir}`
      }
      if (!schemaPath.endsWith('.json') && !schemaPath.endsWith('.graphql') && !schemaPath.endsWith('.prisma')) {
        return `Please specify extension '*.json' for introspection, '*.graphql' for SDL or '*.prisma' for Prisma`
      }
      return true
    },
  })) as GraphQLResolvedConfigData

  newConfig.projects[projectName] = projectConfig

  let extensionEndpoints = {}
  while (await addEndpoint(prompt, extensionEndpoints)) {
    /* noop */
  }

  if (Object.keys(extensionEndpoints).length !== 0) {
    newConfig.projects[projectName].extensions = {
      endpoints: extensionEndpoints,
    }
  }

  let configData: string
  if (
    config.configPath.endsWith('.yaml') ||
    config.configPath.endsWith('.yml')
  ) {
    configData = yaml.safeDump(newConfig)
  } else {
    configData = JSON.stringify(newConfig, null, 2)
  }

  console.log(
    `\nAbout to write new configuration to ${chalk.blue(
      config.configPath,
    )}:\n\n` +
      chalk.yellow(configData) +
      '\n',
  )

  const { save } = await prompt<{ save: boolean }>({
    type: 'confirm',
    name: 'save',
    message: `Is this ok?`,
    default: true,
  })

  if (save) {
    config.saveConfig(newConfig)
  } else {
    console.log('Aborted.')
  }
}
