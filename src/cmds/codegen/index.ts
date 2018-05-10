import { Codegen } from './codegen'
import { CommandBuilder } from 'yargs'

const command: {
  command: string
  describe?: string
  handler: (context: any, argv: any) => any
  builder?: CommandBuilder
} = {
  command: 'codegen',
  describe: 'Generate code for GraphQL Bindings',

  builder: {
    verbose: {
      describe: 'Show verbose output messages',
      type: 'boolean',
      default: 'false',
    },
  },

  handler: async (context: any, argv) => {
    if (!argv.bundle && !argv.bindings) {
      argv.bundle = argv.bindings = true
    }

    const codegen = new Codegen(context, argv)
    await codegen.handle()
  },
}

export = command
