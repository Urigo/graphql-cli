import { PromptModule } from 'inquirer'
import { GraphQLProjectConfig } from 'graphql-config'
import * as ora from 'ora'

import { Context } from './index'

export interface CommandModule {
  command: string,
  desc?: string,
  handler: (context: Context, argv: any) => any
}
