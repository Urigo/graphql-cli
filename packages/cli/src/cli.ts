import { Command } from 'commander';
import { getPluginByName } from './get-plugin';
import { LoadConfigOptions } from '@test-graphql-cli/common';
import chalk from 'chalk';
import globby from 'globby';
import { join } from 'path';

const reportError = (e: Error | string) => {
  console.error(e instanceof Error ? e.message || e : e);
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
    program.option('-r, --require <moduleName>');

    let projectName = '';

    await plugin.init({
      cwd: process.cwd(),
      program,
      reportError,
      loadConfig: (loadConfigOptions: LoadConfigOptions = {}) =>
        import('graphql-config')
          .then(graphqlConfig => graphqlConfig.loadConfig({
            rootDir: process.cwd(),
            throwOnEmpty: false,
            throwOnMissing: false,
            ...loadConfigOptions
          }))
          .then(c => {
            const projectNames = Object.keys(c.projects);
            if (projectName && !projectNames.includes(projectName)) {
              throw new Error(
                `You don't have project ${projectName}.\n` +
                `Available projects are ${projectNames.join(',')}.`
              );
            }
            if (!projectNames.includes('default') && projectNames.length > 0) {
              throw new Error(
                `You don't have 'default' project so you need to specify a project name.\n` +
                `Available projects are ${projectNames.join(',')}.`
              );
            }
            projectName = 'default';
            return c.getProject(projectName);
          })
    });

    // Remove the root object before running, to allow develoeprs to write
    // their own sub-commands.
    // argv.splice(2, 1);

    program.parse(argv);

    if (program.project) {
      projectName = program.project;
    }

    if (program.require) {
      await import(program.require);
    }
  } catch (e) {
    reportError(e);
  }
}
