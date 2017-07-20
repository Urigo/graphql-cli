#!/usr/bin/env node

import { getGraphQLProjectConfig } from 'graphql-config'

const context = {
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
          //TODO: add debug flag for calltrace
          console.log(e.message);
        })
      }
      return commandObject
    }
  })
  .demandCommand()
  .help()
  .completion('completion')
  .argv

// Mutation calls "graphql mutation addUser --id 1 --name Test"
// Find breaking changes
// Execute static .graphql files
