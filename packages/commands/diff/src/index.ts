import { CliPlugin, InitOptions } from '@test-graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { diff, CriticalityLevel, Change } from '@graphql-inspector/core';
import chalk from 'chalk';
import logSymbols from 'log-symbols';
import { GraphQLExtensionDeclaration } from 'graphql-config';

const DiffExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  api.loaders.schema.register(new GitLoader());
  api.loaders.schema.register(new GithubLoader());
  api.loaders.schema.register(new ApolloEngineLoader());
  api.loaders.schema.register(new PrismaLoader());

  return {
    name: 'diff'
  };
};

function hasBreaking(changes: Change[]): boolean {
  return changes.some(c => c.criticality.level === CriticalityLevel.Breaking);
}

function renderChange(change: Change): string[] {
  return [getSymbol(change.criticality.level), chalk.bold(change.message)];
}

function getSymbol(level: CriticalityLevel): string {
  const symbols = {
    [CriticalityLevel.Dangerous]: logSymbols.warning,
    [CriticalityLevel.Breaking]: logSymbols.error,
    [CriticalityLevel.NonBreaking]: logSymbols.success
  };

  return symbols[level];
}

export const plugin: CliPlugin = {
  init({ program, loadConfig, reportError }: InitOptions) {
    program
      .command('diff [baseSchema]')
      .action(async (baseSchemaPtr: string) => {
        try {

          const config = await loadConfig({
            extensions: [DiffExtension]
          })
          if (!baseSchemaPtr) {
            const diffConfig = await config.extension('diff');
            baseSchemaPtr = diffConfig.baseSchema || 'git:origin/master:schema.graphql';
          }
          const [baseSchema, currentSchema] = await Promise.all([
            config.loadSchema(baseSchemaPtr),
            config.getSchema(),
          ]);
          const changes = diff(baseSchema, currentSchema);
  
          if (!changes.length) {
            console.log(logSymbols.success, 'No changes detected');
          } else {
            console.warn(logSymbols.warning, `Detected the following changes (${changes.length}) between schemas:\n`);
  
            changes.forEach(change => {
              console.log(...renderChange(change));
            });
  
            if (hasBreaking(changes)) {
              const breakingCount = changes.filter(c => c.criticality.level === CriticalityLevel.Breaking).length;
              throw `Detected ${breakingCount} breaking change${breakingCount > 1 ? 's' : ''}\n`;
            } else {
              console.log(logSymbols.success, 'No breaking changes detected\n');
            }
            process.exit(0);
          }
        } catch (e) {
          reportError(e);
        }
      });
  }
};
