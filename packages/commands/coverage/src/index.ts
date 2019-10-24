import { CliPlugin } from "@test-graphql-cli/common";
import { coverage } from "@graphql-inspector/core";
import { Source, print } from 'graphql';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config/dist';
import { writeFileSync } from 'fs';
import { join } from 'path';

const CoverageExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader() as any);
  // Documents
  api.loaders.documents.register(new CodeFileLoader() as any);

  return {
    name: 'coverage',
  };
};

export const plugin: CliPlugin = {
    init({ program, loadConfig }) {
        program
            .command('coverage', 'Schema coverage based on documents. Find out how many times types and fields are used in your application.')
            .option('-s, --silent', 'Do not render any stats in the terminal (default: false)')
            .option('-w, --write <s>', 'Write a file with coverage stats (disabled by default)')
            .option('-d, --deprecated', 'Fail on deprecated usage (default: false)')
            .action(async (options: {
                silent: boolean;
                write: string;
                deprecated: boolean;
            }) => {
                const config = await loadConfig({
                    extensions: [CoverageExtension]
                });
                const [ schema, documents ] = await Promise.all([
                    config.getSchema(),
                    config.getDocuments(),
                ])
                const results = coverage(schema, documents.map(doc => new Source(print(doc.document), doc.location)));
                if(options.deprecated) {
                    //TODO   
                }
                if (options.write) {
                    writeFileSync(join(process.cwd(), options.write), JSON.stringify(results));
                }
                if(!options.silent) {
                    console.info(results);
                }
            });
    }
}