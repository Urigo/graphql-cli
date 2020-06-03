import rimraf from 'rimraf';
import { join } from 'path';
import { existsSync } from 'fs-extra';
import { prompt } from 'inquirer';
import { Context, PackageManifest } from '../common';
import { searchCodegenConfig } from '../search-codegen-config';

export async function fromExisting({ context, project }: { context: Context; project: PackageManifest }) {
  const manifestPath = join(context.path, 'package.json');

  if (existsSync(manifestPath)) {
    const { name: projectName } = require(manifestPath);
    context.name = projectName;
  }

  const result = await searchCodegenConfig(context.path);

  if (result && !result.isEmpty) {
    const codegenFilePath = result.filepath;
    const { willBeMerged } = await prompt([
      {
        type: 'confirm',
        name: 'willBeMerged',
        message: `GraphQL Code Generator configuration has been detected in ${codegenFilePath}.\n Do you want to use the same configuration with GraphQL CLI?`,
        default: true,
      },
    ]);

    if (willBeMerged) {
      project.addDependency('@graphql-cli/codegen');
      const codegenConfig = result.config;

      context.graphqlConfig.extensions.codegen = {
        generates: {},
      };

      for (const key in codegenConfig) {
        if (key === 'schema') {
          context.graphqlConfig.schema = codegenConfig.schema;
        } else if (key === 'documents') {
          context.graphqlConfig.documents = codegenConfig.documents;
        } else {
          context.graphqlConfig.extensions.codegen[key] = codegenConfig[key];
        }
      }

      rimraf.sync(result.filepath);
    }
  }
}
