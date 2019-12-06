import { resolve, join } from 'path';
import { CliPlugin, DetailedError } from '@test-graphql-cli/common';
import resolveFrom from 'resolve-from';
import latestVersion from 'latest-version';
import { prompt } from 'inquirer';
import npm from 'npm-programmatic';
import yarn from 'yarn-programmatic';
import { existsSync } from 'fs';

export async function getPluginByName(name: string): Promise<CliPlugin> {
  const possibleNames = [
    `@test-graphql-cli/${name}`,
    `@test-graphql-cli/${name}-plugin`,
    name
  ];
  const possibleModules = possibleNames.concat(
    resolve(process.cwd(), name)).concat(
      ...possibleNames.map(name => resolveFrom.silent(process.cwd(), name))
      )
   .filter(m => m);

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

    
    for (const possiblePackageName of possibleNames) {
      try {
        await latestVersion(possiblePackageName);
        let isInstallAsked = false;
        if (possiblePackageName === '@test-graphql-cli/init') {
          isInstallAsked = true;
        } else {
          const response = await prompt([
            {
              type: 'confirm',
              name: 'isInstallAsked',
              message: `${possiblePackageName} found in npm registry! Do you want to install it?`,
            }
          ]);
          isInstallAsked = response.isInstallAsked;
        }
        if (isInstallAsked) {
          if(existsSync(join(process.cwd(), 'yarn.lock'))) {
            await yarn.install([possiblePackageName], { dev: true });
          } else {
            await npm.install([possiblePackageName], { saveDev: true })
          }
          delete require.cache[possiblePackageName];
          return getPluginByName(name);
        }
      } catch(err){
        if (err.message.indexOf(`Cannot find module '${possiblePackageName}'`) === -1) {
          throw new DetailedError(
            `Unable to install template plugin matching ${possiblePackageName}`,
            err.message,
          );
        }
      }
    }
  
  throw new DetailedError(
    `Unable to find template plugin matching ${name}`,
    `
        Unable to find template plugin matching '${name}'
        Install one of the following packages:
        
        ${possibleNamesMsg}
      `
  );

}
