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

  let extensionEndpoint = {}
  while (await addEndpoint()) {
    console.log('Endpoint was added!')
  }

  if (Object.keys(extensionEndpoint).length !== 0) {
    config.extensions = {
      endpoint: extensionEndpoint
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

  console.log(`About to write to ${configFilename}:\n'${configData}\n`);

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
    let endpoint: any = { url }

    const headers = {}
    while (await addHeader());

    if (Object.keys(headers).length !== 0) {
      endpoint.headers = headers
    }

    const subscriptionUrl = await prompt({
      type: 'input',
      message: 'Subscription URL (Enter to skip):',
    })

    const connectionParams = {}
    if (subscriptionUrl !== '') {
      while (await addConnectionParam());

      if (Object.keys(connectionParams).length === 0) {
        endpoint.subscription = subscriptionUrl
      } else {
        endpoint.subscription = {
          url: subscriptionUrl,
          connectionParams
        }
      }
    }

    if (Object.keys(endpoint).length === 1) {
      endpoint = endpoint.url
    }

    if (Object.keys(extensionEndpoint).length === 0) {
      const addOthers = await prompt({
        type: 'confirm',
        message: 'Do you want to add others endpoints?',
        default: false,
      })
      if (!addOthers) {
        extensionEndpoint = endpoint
        return false;
      }
      console.log('In order to distinguish beetween multiple endpoint you need to provide name for each of them.')
    }

    const name = await prompt({
      type: 'input',
      message: 'Name of this endpoint, for e.g. default, dev, prod:',
      default() {
        return extensionEndpoint['default'] ? undefined : 'default'
      },
      validate(name) {
        if (name === '') {
          return `You can't use empty string as a name.`
        }
        if (extensionEndpoint[name] !== undefined) {
          return `You already used '${name}' name for different endpoint.`
        }
        return true
      }
    })

    extensionEndpoint[name] = endpoint;
    return true;

    async function addHeader() {
      const name = await prompt({
        type: 'input',
        message: 'Name of header (Enter to skip):',
      })
      if (name === '') {
        return false;
      }

      console.log(
        'Note: Don\'t specify passwords, tokens, etc. inside your config.' +
        'Use Environment variables for that, e.g. "Bearer ${env:YOUR_APP_TOKEN}".'
      )

      headers[name] = await prompt({
        type: 'input',
        message: `Value of ${name} header:`,
      })
      return true
    }

    async function addConnectionParam() {
      const name = await prompt({
        type: 'input',
        message: 'Name of connection parameter for subscription (Enter to skip):',
      })
      if (name === '') {
        return false;
      }

      console.log(
        'Note: Don\'t specify passwords, tokens, etc. inside your config.' +
        'Use Environment variables for that, e.g. "${env:YOUR_APP_SUBSCRIPTION_TOKEN}".'
      )

      connectionParams[name] = await prompt({
        type: 'input',
        message: `Value of ${name} connection parameter:`,
      })
      return true
    }
  }

  async function prompt(question) {
    const answers = await context.prompt([
      { ...question, name: 'value' }
    ])
    return answers.value
  }
}

