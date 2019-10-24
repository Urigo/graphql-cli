import { CliPlugin } from "@graphql-cli/common";
import { similar } from "@graphql-inspector/core";
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GraphQLExtensionDeclaration } from 'graphql-config/dist';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SimilarExtension: GraphQLExtensionDeclaration = api => {
    // Schema
    api.loaders.schema.register(new CodeFileLoader() as any);

    return {
        name: 'similar',
    };
};

export const plugin: CliPlugin = {
    init({ program, loadConfig }) {
        program
            .command('similar', 'Get a list of similar types in order to find duplicates.')
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
                console.info(results);
                if (options.write) {
                    writeFileSync(join(process.cwd(), options.write), JSON.stringify(results));
                }
            });
    }
}