import { CliPlugin } from '@test-graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { codegen } from '@graphql-codegen/core';
import { parse, GraphQLSchema } from 'graphql';
import { writeFileSync } from 'fs';
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
  init({ program, loadConfig, reportError, }) {
    program
      .command('codegen [cmd]')
      .allowUnknownOption()
      .action(async (cmd: string) => {
        try {
          const config = await loadConfig({
            extensions: [CodegenExtension],
          });
          const [schema, documents, codegenExtensionConfig] = await Promise.all([
            config.getSchema(),
            config.getDocuments(),
            config.extension<{ [filename: string]: any }>('codegen'),
          ]);
          const cwd = config.dirpath;
          const jobs: Promise<any>[] = [];
          let codegenConfig = codegenExtensionConfig.generates || codegenExtensionConfig;
          for (const filename in codegenConfig) {
            if (
              filename !== 'schema' && 
              filename !== 'documents' && 
              filename !== 'include' && 
              filename !== 'exclude' &&
              filename !== 'config') {
              const pluginsDefinitions = codegenConfig[filename].plugins || codegenConfig[filename];
              const pluginMap: any = {};
              const plugins: any = [];
              for (const pluginDef of pluginsDefinitions) {
                let pluginName: string;
                if (pluginDef === 'string') {
                  pluginName = 'string';
                  plugins.push({ [pluginName]: {}});
                } else if (pluginDef === 'object') {
                  pluginName = Object.keys(pluginDef)[0];
                  plugins.push(pluginDef);
                }
                pluginMap[pluginName] = await import(`@graphql-codegen/` + pluginName).catch(() => import(pluginName));
              }
              jobs.push(codegen({
                  schema: schema instanceof GraphQLSchema ? parse(printSchemaWithDirectives(schema)) : schema,
                  documents: documents.map(
                    doc => ({ filePath: doc.location, content: doc.document })
                  ),
                  filename,
                  config: {...(codegenConfig[filename].config || {}), ...(codegenExtensionConfig.config || {})},
                  pluginMap,
                  plugins,
                })
                .then(result => writeFileSync(join(cwd, filename), result))
                .then(() => console.info(`Generated: ${filename}`)
                )
              );
            }
          }
          await Promise.all(jobs);
        } catch (e) {
          reportError(e);
        }
      });
  }
};
