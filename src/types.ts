import { PromptModule } from 'inquirer'
import { GraphQLProjectConfig, GraphQLConfig } from 'graphql-config'
import { CommandBuilder } from 'yargs'

import { Context } from './index'

export interface CommandObject {
  command: string
  describe?: string
  handler: (context: Context, argv: any) => any
  builder?: CommandBuilder
}

export interface Context {
  prompt: PromptModule
  spinner: any
  getProjectConfig: () => Promise<GraphQLProjectConfig>
  getConfig: () => Promise<GraphQLConfig>
}
