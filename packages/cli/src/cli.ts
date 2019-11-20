import { Command } from 'commander';
import { getPluginByName } from './get-plugin';
import chalk from 'chalk';
import globby from 'globby';
import { join } from 'path';
import logSymbols from 'log-symbols';
import { LoadConfigOptions } from '@test-graphql-cli/common';

const reportError = (e: Error | string) => {
  console.error(logSymbols.error, e instanceof Error ? e.message || e : e);
  process.exit(1);
};

export async function cli(argv = process.argv): Promise<void> {
  try {
    const rootCommand = argv[2];

    if (!rootCommand || rootCommand === '') {
      const foundPlugins = await globby([`node_modules/@test-graphql-cli/**`, `!node_modules/@test-graphql-cli/common`], { cwd: process.cwd(), onlyDirectories: true, deep: 1 });
      const availableCommands = await Promise.all(
        foundPlugins.map(
          pluginPath => import(join(process.cwd(), pluginPath + '/' + 'package.json')).then(m => m.default || m).then(packageJson => `  - ${chalk.cyan(packageJson.name.replace('@test-graphql-cli/', ''))}: ${packageJson.description}\n`)
        )
      );

      throw new Error(
        `\n` +
        `GraphQL CLI Usage:\n` +
        `${chalk.cyan(`graphql`)} requires a command to run successfully.\n` +
        `Check out https://github.com/Urigo/graphql-cli for all available commands and how to use them.\n\n` +
        (
          availableCommands.length ? 
          `Detected available commands: \n\n` +
          availableCommands.join('\n') : ''
        )
      );
    }

    const plugin = await getPluginByName(rootCommand);
    const program = new Command();

    program.option('-p, --project <projectName>');

    let projectName = 'default';

    const loadConfig = async (loadConfigOptions: LoadConfigOptions = {}) => {
      const graphqlConfig = await import('graphql-config');
      const loadedGraphQLConfig = await graphqlConfig.loadConfig({
        rootDir: process.cwd(),
        throwOnEmpty: false,
        throwOnMissing: false,
        ...loadConfigOptions
      });
      const projectNames = Object.keys(loadedGraphQLConfig.projects);
      if (projectName && !projectNames.includes(projectName)) {
        throw new Error(
          `You don't have project ${projectName} so you need to specify an available project name.\n` +
          `Available projects are; ${projectNames.join(',')}.`
        );
      }
      return loadedGraphQLConfig.getProject(projectName);
    };

    await plugin.init({
      cwd: process.cwd(),
      program,
      reportError,
      loadConfig,
    });

    // Remove the root object before running, to allow develoeprs to write
    // their own sub-commands.
    // argv.splice(2, 1);

    program.parse(argv);

    if (program.project) {
      projectName = program.project;
    }

  } catch (e) {
    reportError(e);
  }
}
