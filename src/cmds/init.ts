export const command = 'init'
export const desc = 'Creating GraphQL config from scratch'

import { resolve, dirname } from 'path'
import { existsSync, writeFileSync } from 'fs'
import * as yaml from 'js-yaml'
import {
  GRAPHQL_CONFIG_NAME,
  GRAPHQL_CONFIG_YAML_NAME,
  GraphQLConfigData
} from 'graphql-config'

export async function handler(context, argv) {
  const config: GraphQLConfigData = {
    schemaPath: await prompt({
      type: 'input',
      message: `Path to a schema:`,
      default: 'schema.graphql',
      validate(schemaPath) {
        const parentDir = dirname(schemaPath);
        if (!existsSync(parentDir)) {
          return `Parent dir doesn't exists: ${parentDir}`
        }
        if (!schemaPath.endsWith('.json') && !schemaPath.endsWith('.graphql')) {
          return `Please specify extension '*.json' for insrospection or '*.graphql' for SDL`
        }
        return true
      }
    }),
  }
  //TODO: add include/exclude

  let extensionEndpoints = {}
  while (await addEndpoint()) {
    console.log('Endpoint was added!')
  }

  if (Object.keys(extensionEndpoints).length !== 0) {
    config.extensions = {
      endpoints: extensionEndpoints
    }
  }

  //TODO: add validation of entire config

  const configFormat = await prompt({
    type: 'list',
    message: 'What format do you want to save your config in?',
    choices: ['JSON', 'YAML'],
    default: 'JSON',
  })

  const configFilename = resolve(
    configFormat === 'JSON' ?  GRAPHQL_CONFIG_NAME : GRAPHQL_CONFIG_YAML_NAME
  )
  const configData = configFormat === 'JSON' ?
    JSON.stringify(config, null, 2) :
    yaml.safeDump(config)

  console.log(`About to write to ${configFilename}:\n${configData}\n`);

  const confirmSave = await prompt({
    type: 'confirm',
    message: `Is this ok?`,
    default: true,
  })

  if (confirmSave) {
    writeFileSync(configFilename, configData, 'utf-8')
  } else {
    console.log('Aborted.')
  }

  async function addEndpoint() {
    const url = await prompt({
      type: 'input',
      message: 'Endpoint URL (Enter to skip):',
    })
    if (url === '') {
      return false;
    }

    const name = await prompt({
      type: 'input',
      message: 'Name of this endpoint, for e.g. default, dev, prod:',
      default() {
        return extensionEndpoints['default'] ? undefined : 'default'
      },
      validate(name) {
        if (name === '') {
          return `You can't use empty string as a name.`
        }
        if (extensionEndpoints[name] !== undefined) {
          return `You already used '${name}' name for different endpoint.`
        }
        return true
      }
    })

    let endpoint: any = { url }

    const subscriptionUrl = await prompt({
      type: 'input',
      message: 'Subscription URL (Enter to skip):',
    })

    if (subscriptionUrl !== '') {
      endpoint.subscription = subscriptionUrl
    }

    if (Object.keys(endpoint).length === 1) {
      endpoint = endpoint.url
    }

    let addOthers = false;
    if (Object.keys(extensionEndpoints).length === 0) {
      addOthers = await prompt({
        type: 'confirm',
        message: 'Do you want to add other endpoints?',
        default: false,
      })
    }

    extensionEndpoints[name] = endpoint;
    return addOthers;
  }

  async function prompt(question) {
    const answers = await context.prompt([
      { ...question, name: 'value' }
    ])
    return answers.value
  }
}

