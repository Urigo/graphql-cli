import { CliPlugin } from '@graphql-cli/common';
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { codegen } from '@graphql-codegen/core';
import { parse, print } from 'graphql';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { GraphQLExtensionDeclaration } from 'graphql-config/dist';

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
          const [schema, documents, codegenConfig] = await Promise.all([
            config.getSchema(),
            config.getDocuments(),
            config.extension<{ [filename: string]: string[] }>('codegen'),
          ]);
          const jobs: Promise<any>[] = [];
          for (const filename in codegenConfig) {
            if (filename !== 'schema' && filename !== 'documents') {
              const pluginNames = codegenConfig[filename];
              const pluginInstances = await Promise.all(pluginNames.map(m => import('@graphql-codegen/' + m)));
              const pluginMap:any = {};
              const plugins:any = [];
              for (const pluginNameIndex in pluginNames) {
                const pluginName = pluginNames[pluginNameIndex];
                pluginMap[pluginName] = pluginInstances[pluginNameIndex];
                plugins.push({ [pluginName]: {}});
              }
              jobs.push(codegen({
                  schema: parse(print(schema as any)),
                  documents: documents.map(
                    doc => ({ filePath: doc.location, content: doc.document })
                  ),
                  filename,
                  config: {},
                  pluginMap,
                  plugins,
                }).then(result => writeFileSync(join(process.cwd(), filename), result))
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
