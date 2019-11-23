import { CliPlugin } from '@test-graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { codegen } from '@graphql-codegen/core';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import Listr from 'listr';

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

export const plugin: CliPlugin = {
  init({ program, loadConfig, reportError }) {
    program
      .command('codegen')
      .action(async () => {
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
          let fileNameMap = codegenExtensionConfig.generates || Object.keys(codegenExtensionConfig).filter((key: string) => (
            key !== 'schema' &&
            key !== 'documents' &&
            key !== 'include' &&
            key !== 'exclude' &&
            key !== 'config')).reduce((obj, key) => {
              obj[key] = codegenExtensionConfig[key];
              return obj
            }, {});
          const globalConfig = codegenExtensionConfig.config || {};
          const tasks = new Listr(Object.keys(fileNameMap).map(filename => ({
            title: `Generate ${filename}`,
            task: async (ctx, task) => {
              const pluginsDefinitions = fileNameMap[filename].plugins || fileNameMap[filename];
              const pluginMap: any = {};
              const plugins: any = [];
              await Promise.all(pluginsDefinitions.map(async (pluginDef: any) => {
                let pluginName: string;
                if (typeof pluginDef === 'string') {
                  pluginName = pluginDef;
                  plugins.push({ [pluginName]: {} });
                } else if (typeof pluginDef === 'object') {
                  pluginName = Object.keys(pluginDef)[0];
                  plugins.push(pluginDef);
                }
                pluginMap[pluginName] = await import(`@graphql-codegen/` + pluginName).catch(() => import(pluginName));
              }));
              const fileNameSpecificConfig = fileNameMap[filename].config || {};
              const result = await codegen({
                schema,
                documents: documents.map(
                  doc => ({ filePath: doc.location, content: doc.document })
                ),
                filename,
                config: { ...globalConfig, ...fileNameSpecificConfig },
                pluginMap,
                plugins,
              });
              const targetPath = join(cwd, filename);
              if ('overwrite' in codegenExtensionConfig && !codegenExtensionConfig.overwrite) {
                if (existsSync(targetPath)) {
                  task.skip(`${targetPath} already exists! Skipping.`);
                }
              } else {
                writeFileSync(targetPath, result);
              }
            }
          })));
          await tasks.run();
        } catch (e) {
          reportError(e);
        }
      });
  }
};
