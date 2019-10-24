import { CliPlugin } from '@test-graphql-cli/common';
import { validate } from '@graphql-inspector/core';
import { Source, print } from 'graphql';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config/dist';

const ValidateExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  // Documents
  api.loaders.documents.register(new CodeFileLoader());

  return {
    name: 'validate',
  };
};

export const plugin: CliPlugin = {
    init({ program, loadConfig }) {
        program
            .command('validate')
            .option('-d, --deprecated', 'Fail on deprecated usage (default: false)')
            .option('--noStrictFragments', 'Do not fail on duplicated fragment names (default: false)')
            .option('--apollo', 'Support Apollo directives (@client and @connection) (default: false)')
            .option('--maxDepth <n>', 'Fail when operation depth exceeds maximum depth (default: false)')
            .action(async (options: {
                strictDeprecated: boolean;
                noStrictFragments: boolean;
                apollo: boolean;
                maxDepth: number;
            }) => {
                const config = await loadConfig({
                    extensions: [ValidateExtension]
                });
                const [ schema, documents ] = await Promise.all([
                    config.getSchema(),
                    config.getDocuments(),
                ]);

                const results = validate(schema, documents.map(doc => new Source(print(doc.document), doc.location)), options);
                console.log(results);
            })
    }
}
