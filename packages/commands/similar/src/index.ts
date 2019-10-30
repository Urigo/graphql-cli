import { CliPlugin } from "@test-graphql-cli/common";
import { similar } from "@graphql-inspector/core";
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config/extension';
import { writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const SimilarExtension: GraphQLExtensionDeclaration = api => {
    // Schema
    api.loaders.schema.register(new CodeFileLoader());
    api.loaders.documents.register(new GitLoader());
    api.loaders.documents.register(new GithubLoader());

    return {
        name: 'similar',
    };
};

export const plugin: CliPlugin = {
    init({ program, loadConfig }) {
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
                const config = await loadConfig({
                    extensions: [SimilarExtension]
                });
                const schema = await config.getSchema();
                const results = similar(schema, options.type, options.threshold);
                for (const key in results) {
                    console.info(chalk.bold.underline(key) + ':');
                    const result = results[key];
                    for (const rating of result.ratings) {
                        console.info(`  Target:` + chalk.underline(rating.target.typeId + ' ' + rating.target.value))
                        console.info(`  Rating:` + rating.rating.toString())
                    }
                }
                if (options.write) {
                    writeFileSync(join(process.cwd(), options.write), JSON.stringify(results));
                }
            });
    }
}