#!/usr/bin/env node

import * as ora from 'ora'
import * as inquirer from 'inquirer'
import { getGraphQLProjectConfig } from 'graphql-config'

const context = {
  prompt: inquirer.createPromptModule(),
  spinner: ora(),
  getConfig() {
    return getGraphQLProjectConfig()
  }
}

require('yargs')
  .commandDir('cmds', {
    visit: (commandObject) => {
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
          console.log(e.message);
          //FIXME: set non-zero exit code
        })
      }
      return commandObject
    }
  })
  .demandCommand()
  .help()
  .completion('completion')
  .recommendCommands()
  .argv

// Mutation calls "graphql mutation addUser --id 1 --name Test"
// Execute static .graphql files
