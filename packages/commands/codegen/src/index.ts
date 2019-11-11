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
              const pluginNames = codegenConfig[filename].plugins || codegenConfig[filename];
              const pluginInstances: any = await Promise.all(pluginNames.map((m: string) => import('@graphql-codegen/' + m)));
              const pluginMap:any = {};
              const plugins:any = [];
              for (const pluginNameIndex in pluginNames) {
                const pluginName = pluginNames[pluginNameIndex];
                pluginMap[pluginName] = pluginInstances[pluginNameIndex];
                plugins.push({ [pluginName]: {}});
              }
              const pluginConfig = {...(codegenConfig[filename].config || {}), ...(codegenExtensionConfig.config || {})};
              jobs.push(codegen({
                  schema: schema instanceof GraphQLSchema ? parse(printSchemaWithDirectives(schema)) : schema,
                  documents: documents.map(
                    doc => ({ filePath: doc.location, content: doc.document })
                  ),
                  filename,
                  config: pluginConfig,
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
