import { CliPlugin } from "@graphql-cli/common";
import { coverage } from "@graphql-inspector/core";
import { Source, print } from 'graphql';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const CoverageExtension: GraphQLExtensionDeclaration = api => {
    // Schema
    api.loaders.schema.register(new CodeFileLoader());
    api.loaders.schema.register(new GitLoader());
    api.loaders.schema.register(new GithubLoader());
    api.loaders.schema.register(new ApolloEngineLoader());
    api.loaders.schema.register(new PrismaLoader());
    // Documents
    api.loaders.documents.register(new CodeFileLoader());
    api.loaders.documents.register(new GitLoader());
    api.loaders.documents.register(new GithubLoader());

    return {
        name: 'coverage',
    };
};

export const plugin: CliPlugin = {
    init({ program, loadProjectConfig, reportError }) {
        program
            .command('coverage')
            .option('-s, --silent', 'Do not render any stats in the terminal (default: false)')
            .option('-w, --write <s>', 'Write a file with coverage stats (disabled by default)')
            .action(async (options: {
                silent: boolean;
                write: string;
                deprecated: boolean;
            }) => {
                try {
                    const config = await loadProjectConfig({
                        extensions: [CoverageExtension]
                    });
                    const [schema, documents] = await Promise.all([
                        config.getSchema(),
                        config.getDocuments(),
                    ])
                    const results = coverage(schema, documents.map(doc => new Source(print(doc.document), doc.location)));
                    if (!options.silent) {
                        for (const typeName in results.types) {
                            const result = results.types[typeName];
                            console.info(`type ` + chalk.bold.underline(result.type.name.toString()) + ` x ${result.hits} {`)
                            for (const childName in result.children) {
                                const childResult = result.children[childName];
                                console.info(`  ` + chalk.bold(childName) + ` x ${childResult.hits}`)
                            }
                            console.info(`}`)
                        }
                    }
                    if (options.write) {
                        writeFileSync(join(process.cwd(), options.write), JSON.stringify(results, null, 2));
                    }
                } catch (e) {
                    reportError(e);
                }
            });
    }
}