import { CliPlugin } from '@graphql-cli/common';
import { CodegenExtension, CodegenContext, generate, updateContextWithCliFlags, setCommandOptions } from '@graphql-codegen/cli';

export const plugin: CliPlugin = {
  async init({ program, loadGraphQLConfig, reportError }) {
    // Let codegen manage our command instance with its own options
    setCommandOptions(program.command('codegen') as any)
      .action(async (cliFlags: any) => {
        try {
          // Load root GraphQL Config not Project Config because Codegen will update it by looking at `project` param
          const graphqlConfig: any = await loadGraphQLConfig({
            extensions: [CodegenExtension]
          });
          // Create Codegen Context with our loaded GraphQL Config
          const codegenContext = new CodegenContext({
            graphqlConfig,
          });
          // This will update Codegen Context with the options provided in CLI arguments
          updateContextWithCliFlags(codegenContext, cliFlags);
          await generate(codegenContext);
        } catch (e) {
          reportError(e);
        }
      });
  }
};
