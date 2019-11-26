import { CliPlugin, DetailedError } from '@graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { codegen } from '@graphql-codegen/core';
import { writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import Listr from 'listr';
import { Types, CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import resolveFrom from 'resolve-from';

const CodegenExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  api.loaders.documents.register(new GitLoader());
  api.loaders.documents.register(new GithubLoader());
  // Documents
  api.loaders.documents.register(new CodeFileLoader());
  api.loaders.documents.register(new GitLoader());
  api.loaders.documents.register(new GithubLoader());

  return {
    name: 'codegen',
  };
};

async function getCodegenPluginByName(name: string, pluginLoader: Types.PackageLoaderFn<CodegenPlugin>): Promise<CodegenPlugin> {
  const possibleNames = [
    `@graphql-codegen/${name}`,
    `@graphql-codegen/${name}-template`,
    `@graphql-codegen/${name}-plugin`,
    `graphql-codegen-${name}`,
    `graphql-codegen-${name}-template`,
    `graphql-codegen-${name}-plugin`,
    `codegen-${name}`,
    `codegen-${name}-template`,
    name,
  ];

  const possibleModules = possibleNames.concat(
    resolve(process.cwd(), name)).concat(
      ...possibleNames.map(name => resolveFrom.silent(process.cwd(), name))
      )
   .filter(m => m);

  for (const moduleName of possibleModules) {
    try {
      return (await pluginLoader(moduleName)) as CodegenPlugin;
    } catch (err) {
      if (err.message.indexOf(`Cannot find module '${moduleName}'`) === -1) {
        throw new DetailedError(
          `Unable to load codegen template plugin matching ${name}`,
          `
              Unable to load codegen template plugin matching '${name}'.
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

export const plugin: CliPlugin = {
  init({ program, loadConfig, reportError }) {
    program
      .command('codegen')
      .option('-s, --silent', 'Not to print anything')
      .option('-w, --watch', 'Watch for changes and execute generation automatically')
      .option('-o, --overwrite', 'Overwrites existing files')
      .action(async (cliFlags: { silent?: boolean, watch?: boolean, overwrite?: boolean }) => {
        try {
          const config = await loadConfig({
            extensions: [CodegenExtension],
          });
          const [schema, documents, codegenExtensionConfig] = await Promise.all([
            config.getSchema('DocumentNode'),
            config.getDocuments(),
            config.extension<any>('codegen'),
          ]);
          const cwd = config.dirpath;
          let fileNameMap = codegenExtensionConfig.generates || codegenExtensionConfig;
          const excludeKeyList = ['schema', 'documents', 'include', 'exclude', 'config'];
          const fileNames = Object.keys(fileNameMap).filter(key => !excludeKeyList.includes(key));
          const globalConfig = codegenExtensionConfig.config || {};
          const tasks = new Listr(fileNames.map(filename => ({
            title: `Generate ${filename}`,
            task: async (ctx, task) => {
              const pluginsDefinitions = fileNameMap[filename].plugins || fileNameMap[filename];
              const pluginMap: { [pluginName: string]: CodegenPlugin<any> } = {};
              const fileNameSpecificConfig = fileNameMap[filename].config || {};
              const [
                fileNameSpecificSchema,
                fileNameSpecificDocuments,
                plugins,
              ] = await Promise.all([
                fileNameMap[filename].schema ? await config.loadSchema(fileNameMap[filename].schema, 'DocumentNode') : schema,
                fileNameMap[filename].documents ? await config.loadDocuments(fileNameMap[filename].documents) : documents,
                Promise.all<{ [pluginName: string]: Types.ConfiguredPlugin }>(pluginsDefinitions.map(async (pluginDef: any) => {
                  let pluginName: string;
                  let plugin: { [pluginName: string]: Types.ConfiguredPlugin };
                  if (typeof pluginDef === 'string') {
                    pluginName = pluginDef;
                    plugin = { [pluginName]: {} };
                  } else if (typeof pluginDef === 'object') {
                    pluginName = Object.keys(pluginDef)[0];
                    plugin = pluginDef;
                  }
                  // TODO: Add custom loader and preset support
                  pluginMap[pluginName] = await getCodegenPluginByName(pluginName, name => import(name));
                  return plugin;
                }))
              ]);
              const result = await codegen({
                schema: fileNameSpecificSchema,
                documents: fileNameSpecificDocuments.map(
                  doc => ({ filePath: doc.location, content: doc.document })
                ),
                filename,
                config: { ...globalConfig, ...fileNameSpecificConfig },
                pluginMap,
                plugins,
              });
              const targetPath = join(cwd, filename);
              if (
                ('overwrite' in codegenExtensionConfig && !codegenExtensionConfig.overwrite) ||
                ('overwrite' in cliFlags && !cliFlags.overwrite)
              ) {
                if (existsSync(targetPath)) {
                  task.skip(`${targetPath} already exists! Skipping.`);
                }
              } else {
                writeFileSync(targetPath, result);
              }
            }
          })), { 
            renderer: cliFlags.silent ? 'silent': 'default',
            // it doesn't stop when one of tasks failed, to finish at least some of outputs
            exitOnError: false,
            // run 4 at once
            concurrent: 4,
          });
          await tasks.run();
        } catch (e) {
          reportError(e);
        }
      });
  }
};
