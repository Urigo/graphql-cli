export const command = 'add-endpoint'
export const desc = 'add new endpoint to .graphqlconfig'

import * as chalk from 'chalk';
import { addEndpoint } from './init'
import { difference } from 'lodash';
import { Context } from '../';

export async function handler(context: Context) {
  const { prompt, getConfig, getProjectConfig } = context;

  const projectConfig = getProjectConfig();
  const extensionEndpoints = projectConfig.extensions.endpoints || {}

  const oldEndpoints = Object.keys(extensionEndpoints);
  while (await addEndpoint(prompt, extensionEndpoints)) {
  }

  const newEndpoints = difference(Object.keys(extensionEndpoints), oldEndpoints);

  if (newEndpoints.length == 0) {
    console.log(chalk.yellow('You haven\'t added any endpoint'))
    return;
  }

  const newConfig = projectConfig.config;
  newConfig.extensions = newConfig.extensions || {}
  newConfig.extensions.endpoints = extensionEndpoints;

  console.log(
    'Adding the following endpoints to your config: ',
    chalk.blue(newEndpoints.join(', '))
  );

  const { save } = await prompt({
    type: 'confirm',
    name: 'save',
    message: `Is this ok?`,
    default: true,
  });

  if (save) {
    getConfig().saveConfig(newConfig, projectConfig.projectName)
  } else {
    console.log('Aborted.')
  }
}
