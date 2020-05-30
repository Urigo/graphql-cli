import yargs from 'yargs';
import globby from 'globby';
import { join } from 'path';
import { CommandFactory, useConfig, useLoaders } from '@graphql-cli/common';
import discover from './discover';

export async function cli(): Promise<void> {
  const program = yargs
    .scriptName('graphql')
    .detectLocale(false)
    .epilog('Visit https://github.com/Urigo/graphql-cli for more information')
    .version();

  const commandPackageNames = await discoverCommands();
  const commandFactories = await Promise.all(commandPackageNames.map(loadCommand));

  [discover, ...commandFactories].forEach((cmd) => {
    program.command(
      cmd({
        useConfig,
        useLoaders,
      })
    );
  });

  program.demandCommand().recommendCommands().help().showHelpOnFail(false).argv;
}

async function discoverCommands() {
  const commandNames = await globby('*', {
    cwd: join(process.cwd(), 'node_modules/@graphql-cli'),
    onlyDirectories: true,
    deep: 1,
    ignore: ['common', 'loaders'],
  });

  return commandNames;
}

function loadCommand(name: string): CommandFactory {
  const mod = require(`@graphql-cli/${name}`);

  return mod.default || mod;
}
