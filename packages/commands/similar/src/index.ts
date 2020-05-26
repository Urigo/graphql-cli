import { CliPlugin } from "@graphql-cli/common";
import { similar } from "@graphql-inspector/core";
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import { writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const SimilarExtension: GraphQLExtensionDeclaration = api => {
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
        name: 'similar',
    };
};

export const colorizePercentage = (percentage: number) => {
    if (percentage > 75) {
        return chalk.red(Math.floor(percentage) + '%');
    }
    if (percentage > 50) {
        return chalk.yellow(Math.floor(percentage) + '%');
    }
    return chalk.green(Math.floor(percentage) + '%');
}

export const plugin: CliPlugin = {
    init({ program, loadProjectConfig, reportError }) {
        program
            .command('similar')
            .option('-n, --type <s>', 'Check only a single type (checks all types by default)')
            .option('-t, --threshold <n>', 'Threshold of similarity ratio (default: 0.4)')
            .option('-w, --write <s>', 'Write a file with results')
            .action(async (options: {
                type: string;
                threshold: number;
                write: string;
            }) => {
                try {
                    const config = await loadProjectConfig({
                        extensions: [SimilarExtension]
                    });
                    const schema = await config.getSchema();
                    const results = similar(schema, options.type, options.threshold);
                    for (const key in results) {
                        const result = results[key];
                        if (result.ratings.length > 0) {
                            console.info(chalk.bold.underline(key) + ':');
                            for (const rating of result.ratings) {
                                console.info(`  ` + rating.target.typeId + ': ' + colorizePercentage(rating.rating * 100));
                            }
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