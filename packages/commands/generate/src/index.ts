import { CliPlugin } from "@test-graphql-cli/common";
import { generateUsingPlugins, createDBResources } from "graphback-cli"

interface CliFlags {
  db: boolean, backend: boolean, silent: boolean, watch: boolean
}

export const plugin: CliPlugin = {
  init({ program, reportError }) {
    program
      .command('generate')
      .option('--db')
      .option('--backend')
      .option('--silent')
      .option('-w, --watch', 'Watch for changes and execute generation automatically')
      .action(async (cliFlags: CliFlags) => {
        try {
          if (cliFlags.backend) {
            await generateUsingPlugins(cliFlags)
          } else if (cliFlags.db) {
            await createDBResources({})
          } else {
            await generateUsingPlugins(cliFlags)
          }
        } catch (e) {
          reportError(e);
        }
      })
  }
}
