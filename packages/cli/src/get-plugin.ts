import { resolve } from 'path';
import { CliPlugin, DetailedError } from '@graphql-cli/common';

export async function getPluginByName<TConfig>(name: string): Promise<CliPlugin> {
  const possibleNames = [
    `@graphql-cli/${name}`,
    `@graphql-cli/${name}-plugin`,
    name
  ];
  const possibleModules = possibleNames.concat(resolve(process.cwd(), name)).concat(...possibleNames.map(name => resolve(process.cwd(), './node_modules/' + name)));

  for (const moduleName of possibleModules) {
    try {
      const rawImport = await import(moduleName);

      if (!rawImport) {
        throw new Error(`Plugin doesn't export a valid signature!`);
      }

      return rawImport.plugin || rawImport.default;
    } catch (err) {
      if (err.message.indexOf(`Cannot find module '${moduleName}'`) === -1) {
        throw new DetailedError(
          `Unable to load CLI plugin matching ${name}`,
          `
              Unable to load CLI plugin matching '${name}'.
              Reason: 
                ${err.message}
            `
        );
      }
    }
  }

  const possibleNamesMsg = possibleNames
    .map(name =>
      `
        - ${name}
    `.trimRight()
    )
    .join('');

  throw new DetailedError(
    `Unable to find template plugin matching ${name}`,
    `
        Unable to find template plugin matching '${name}'
        Install one of the following packages:
        
        ${possibleNamesMsg}
      `
  );
}
