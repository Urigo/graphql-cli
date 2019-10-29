import { CliPlugin } from '@test-graphql-cli/common';
import { validate } from '@graphql-inspector/core';
import { Source, print } from 'graphql';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config/extension';
import chalk from 'chalk';

const ValidateExtension: GraphQLExtensionDeclaration = api => {
    // Schema
    api.loaders.schema.register(new CodeFileLoader());
    api.loaders.documents.register(new GitLoader());
    api.loaders.documents.register(new GithubLoader());
    // Documents
    api.loaders.documents.register(new CodeFileLoader());
    api.loaders.documents.register(new GitLoader());
    api.loaders.documents.register(new GithubLoader());

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
                const [schema, documents] = await Promise.all([
                    config.getSchema(),
                    config.getDocuments(),
                ]);

                const results = validate(schema, documents.map(doc => new Source(print(doc.document), doc.location)), options);
                for (const result of results) {
                    for (const error of result.errors) {
                        for (const location of error.locations) {
                            console.error(chalk.bold.underline(`${result.source.name}:${location.line}:${location.column};`));
                            console.error(` ` + chalk.red(`Error: ${error.message}`));
                        }
                    }
                    for (const error of result.deprecated) {
                        for (const location of error.locations) {
                            console.error(chalk.bold.underline(`${result.source.name}:${location.line}:${location.column};`));
                            console.error(` ` + chalk.red(`Error: ${error.message}`));
                        }
                    }
                }
                if (results.length === 0) {
                    console.info(`Documents are valid against the schema!`);
                }
            })
    }
}
