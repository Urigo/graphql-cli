import { CliPlugin } from '@test-graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { codegen } from '@graphql-codegen/core';
import { parse, GraphQLSchema } from 'graphql';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import { printSchemaWithDirectives } from '@graphql-toolkit/common';

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
  init({ program, loadConfig }) {
    program
      .command('codegen')
      .action(async () => {
        const config = await loadConfig({
          extensions: [CodegenExtension],
        });
        const [schema, documents, codegenExtensionConfig] = await Promise.all([
          config.getSchema(),
          config.getDocuments(),
          config.extension<{ [filename: string]: any }>('codegen'),
        ]);
        const cwd = config.dirpath;
        let codegenConfig = codegenExtensionConfig.generates || codegenExtensionConfig;
        await Promise.all(
          Object.keys(codegenConfig).map(async filename => {
            if (
              filename !== 'schema' &&
              filename !== 'documents' &&
              filename !== 'include' &&
              filename !== 'exclude' &&
              filename !== 'config') {
              const pluginsDefinitions = codegenConfig[filename].plugins || codegenConfig[filename];
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
              const result = await codegen({
                schema: schema instanceof GraphQLSchema ? parse(printSchemaWithDirectives(schema)) : schema,
                documents: documents.map(
                  doc => ({ filePath: doc.location, content: doc.document })
                ),
                filename,
                config: { ...(codegenConfig[filename].config || {}), ...(codegenExtensionConfig.config || {}) },
                pluginMap,
                plugins,
              });
              const targetPath = join(cwd, filename);
              if ('overwrite' in codegenExtensionConfig && !codegenExtensionConfig.overwrite) {
                if (existsSync(targetPath)) {
                  console.info(`${targetPath} already exists! Skipping.`);
                }
                return;
              }
              writeFileSync(targetPath, result);
              console.info(`Generated: ${filename}`);
            }
          })
        )
      });
  }
};
