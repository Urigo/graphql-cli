import { CliPlugin } from '@test-graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { codegen } from '@graphql-codegen/core';
import { parse } from 'graphql';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { GraphQLExtensionDeclaration } from 'graphql-config/extension';
import { printSchemaWithDirectives } from '@graphql-toolkit/common';

const CodegenExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader() as any);
  // Documents
  api.loaders.documents.register(new CodeFileLoader() as any);

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
          const jobs: Promise<any>[] = [];
          let codegenConfig = codegenExtensionConfig.generates || codegenExtensionConfig;
          for (const filename in codegenConfig) {
            if (
              filename !== 'schema' && 
              filename !== 'documents' && 
              filename !== 'include' && 
              filename !== 'exclude' &&
              filename !== 'config') {
              const pluginNames = codegenConfig[filename];
              const pluginInstances: any = await Promise.all(pluginNames.map((m: string) => import('@graphql-codegen/' + m)));
              const pluginMap:any = {};
              const plugins:any = [];
              for (const pluginNameIndex in pluginNames) {
                const pluginName = pluginNames[pluginNameIndex];
                pluginMap[pluginName] = pluginInstances[pluginNameIndex];
                plugins.push({ [pluginName]: {}});
              }
              jobs.push(codegen({
                  schema: parse(printSchemaWithDirectives(schema)),
                  schemaAst: schema,
                  documents: documents.map(
                    doc => ({ filePath: doc.location, content: doc.document })
                  ),
                  filename,
                  config: codegenExtensionConfig.config,
                  pluginMap,
                  plugins,
                })
                .then(result => writeFileSync(join(process.cwd(), filename), result))
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
