import { Command } from 'commander';
import { getPluginByName } from './get-plugin';
import { LoadConfigOptions } from '@test-graphql-cli/common';
import { loadConfig } from 'graphql-config';

export async function cli(argv = process.argv): Promise<void> {
  const rootCommand = argv[2];

  if (!rootCommand || rootCommand === '') {
    throw new Error('Command not specified!');
  }

  const plugin = await getPluginByName(rootCommand);
  const program = new Command();

  const reportError = (e: Error) => {
    console.error(e);
    process.exit(1);
  };

  try {

    program.option('-r, --require <moduleName>');
    program.option('-p, --project <projectName>');
  
    if (program.require) {
      await import(program.require);
    }

    let projectName = 'default';

    if (program.project) {
      projectName = program.project;
    }

    await plugin.init({
      cwd: process.cwd(),
      program,
      reportError,
      loadConfig: (loadConfigOptions: LoadConfigOptions = {}) => loadConfig({
        rootDir: process.cwd(),
        throwOnEmpty: false,
        throwOnMissing: false,
        ...loadConfigOptions,
      }).then(c => {
        const projectNames = Object.keys(c.projects);
        if (!projectNames.includes(projectName)) {
          throw new Error(`You don't have project ${projectName}. Available projects are ${projectNames.join(',')}`);
        }
        return c.getProject(projectName);
      }),
    });

    program.parse(argv);

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
