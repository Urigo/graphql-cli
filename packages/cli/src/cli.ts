import { Command } from 'commander';
import { getPluginByName } from './get-plugin';
import { LoadConfigOptions } from '@test-graphql-cli/common';
import chalk from 'chalk';

export async function cli(argv = process.argv): Promise<void> {
  try {
    const rootCommand = argv[2];

    if (!rootCommand || rootCommand === '') {
      console.error(`Usage: ${chalk.cyan(`graphql`)} requires a command to run successfully:
      For example: ${chalk.cyan(`graphql init`)} 
      Check out https://github.com/Urigo/graphql-cli for available commands and how to use them.
      `);
      process.exit(1);
    }

    const plugin = await getPluginByName(rootCommand);
    const program = new Command();

    const reportError = (e: Error) => {
      console.error(e);
      process.exit(1);
    };

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
              throw new Error(`
            You don't have project ${projectName}.
            Available projects are ${projectNames.join(',')}.
          `);
            }
            if (!projectNames.includes('default') && projectNames.length > 0) {
              throw new Error(`
            You don't have 'default' project so you need to specify a project name.
            Available projects are ${projectNames.join(',')}.
          `);
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
    console.error(e);
    process.exit(1);
  }
}
