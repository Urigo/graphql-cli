export const command = 'init'
export const describe = 'Setup .graphqlconfig file'

import { resolve, dirname } from 'path'
import { existsSync, writeFileSync } from 'fs'
import * as yaml from 'js-yaml'
import chalk from 'chalk'

import {
  GRAPHQL_CONFIG_NAME,
  GRAPHQL_CONFIG_YAML_NAME,
  GraphQLResolvedConfigData,
} from 'graphql-config'

import { Context } from '../'

export async function handler (context: Context) {
  const { prompt } = context

  const { projectName }: {[key: string]: string} = await prompt({
    type: 'input',
    name: 'projectName',
    message: 'Enter project name (Enter to skip):'
  })

  let config: GraphQLResolvedConfigData = await prompt({
    type: 'input',
    name: 'schemaPath',
    message: `Local schema file path:`,
    default: 'schema.graphql',
    validate (schemaPath) {
      const parentDir = dirname(schemaPath)
      if (!existsSync(parentDir)) {
        return `Parent dir doesn't exists: ${parentDir}`
      }
      if (!schemaPath.endsWith('.json') && !schemaPath.endsWith('.graphql')) {
        return `Please specify extension '*.json' for introspection or '*.graphql' for SDL`
      }
      return true
    },
  }) as GraphQLResolvedConfigData

  let extensionEndpoints = {}
  while (await addEndpoint(prompt, extensionEndpoints)) {
    /* noop */
  }

  if (Object.keys(extensionEndpoints).length !== 0) {
    config.extensions = {
      endpoints: extensionEndpoints,
    }
  }

  let finalConfig: any = config
  if (projectName) {
    finalConfig = { projects: {
      [projectName]: config
    }}
  }

  // TODO: add validation of entire config

  const { configFormat } = await prompt({
    type: 'list',
    name: 'configFormat',
    message: 'What format do you want to save your config in?',
    choices: ['JSON', 'YAML'],
    default: 'JSON',
  })

  const configFilename = resolve(
    configFormat === 'JSON' ? GRAPHQL_CONFIG_NAME : GRAPHQL_CONFIG_YAML_NAME,
  )
  const configData = configFormat === 'JSON' ?
    JSON.stringify(finalConfig, null, 2) :
    yaml.safeDump(finalConfig)

  console.log(
    `\nAbout to write to ${chalk.blue(configFilename)}:\n\n` +
    chalk.yellow(configData) + '\n',
  )

  const { confirmSave } = await prompt({
    type: 'confirm',
    name: 'confirmSave',
    message: `Is this ok?`,
    default: true,
  })

  if (confirmSave) {
    writeFileSync(configFilename, configData, 'utf-8')
  } else {
    console.log('Aborted.')
  }
}

export async function addEndpoint (prompt: Context['prompt'], extensionEndpoints) {
  const { url } = await prompt({
    name: 'url',
    type: 'input',
    message: 'Endpoint URL (Enter to skip):',
    validate (url) {
      if (url === '') {
        return true
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'URL should start with either "http://" or "https://"'
      }
      return true
    },
  })
  if (url === '') {
    return false
  }

  const { name } = await prompt({
    type: 'input',
    name: 'name',
    message: 'Name of this endpoint, for e.g. default, dev, prod:',
    default () {
      return extensionEndpoints['default'] ? undefined : 'default'
    },
    validate (name) {
      if (name === '') {
        return `You can't use empty string as a name.`
      }
      if (extensionEndpoints[name] !== undefined) {
        return `You already used '${name}' name for different endpoint.`
      }
      return true
    },
  })

  let endpoint: any = { url }

  const { subscriptionUrl } = await prompt({
    type: 'input',
    name: 'subscriptionUrl',
    message: 'Subscription URL (Enter to skip):',
  })

  if (subscriptionUrl !== '') {
    endpoint.subscription = subscriptionUrl
  }

  if (Object.keys(endpoint).length === 1) {
    endpoint = endpoint.url
  }

  extensionEndpoints[name] = endpoint

  return (await prompt({
    type: 'confirm',
    name: 'continue',
    message: 'Do you want to add other endpoints?',
    default: false,
  })).continue
}
