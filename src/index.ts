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
      commandObject.handler = (argv => originalHandler(context, argv))
      return commandObject
    }
  })
  .demandCommand()
  .help()
  .completion('completion')
  .argv

// Mutation calls "graphql mutation addUser --id 1 --name Test"
// Find breaking changes
