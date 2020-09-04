import { prompt } from 'inquirer';
import { Context, PackageManifest, ProjectType, FrontendType, BackendType, askForEnum } from '../common';

export async function askForCodegen({ context, project }: { context: Context; project: PackageManifest }) {
  if (!context.graphqlConfig.extensions.codegen) {
    const { isCodegenAsked } = await prompt([
      {
        type: 'confirm',
        name: 'isCodegenAsked',
        message: 'Do you want to use GraphQL Code Generator?',
        default: true,
      },
    ]);
    if (isCodegenAsked) {
      project.addDependency('@graphql-cli/codegen');
      project.addScript('graphql:codegen', 'graphql codegen');

      context.graphqlConfig.extensions.codegen = {
        generates: {},
      };
      let codegenPlugins = new Set<string>();
      if (context.type === ProjectType.FullStack || context.type === ProjectType.BackendOnly) {
        const backendType = await askForEnum({
          enum: BackendType,
          message: 'What type of backend do you use?',
          defaultValue: BackendType.TS,
        });

        switch (backendType) {
          case BackendType.TS:
            codegenPlugins.add('typescript');
            codegenPlugins.add('typescript-resolvers');
            break;
          case BackendType.Java:
            codegenPlugins.add('java');
            codegenPlugins.add('java-resolvers');
            break;
          case BackendType.Kotlin:
            codegenPlugins.add('java');
            codegenPlugins.add('java-kotlin');
            break;
        }

        const { backendGeneratedFile } = await prompt([
          {
            type: 'input',
            name: 'backendGeneratedFile',
            message: 'Where do you want to have generated backend code?',
            default: './generated-backend.ts',
          },
        ]);

        context.graphqlConfig.extensions.codegen.generates[backendGeneratedFile] = {
          plugins: [...codegenPlugins],
        };
      }

      if (context.type === ProjectType.FullStack || context.type === ProjectType.FrontendOnly) {
        const frontendType = await askForEnum({
          enum: FrontendType,
          message: 'What type of frontend do you use?',
          defaultValue: FrontendType.TSReactApollo,
        });

        switch (frontendType) {
          case FrontendType.TSReactApollo:
            codegenPlugins.add('typescript');
            codegenPlugins.add('typescript-react-apollo');
            break;
          case FrontendType.ApolloAngular:
            codegenPlugins.add('typescript');
            codegenPlugins.add('typescript-apollo-angular');
            break;
          case FrontendType.StencilApollo:
            codegenPlugins.add('typescript');
            codegenPlugins.add('typescript-stencil-apollo');
            break;
          case FrontendType.TSUrql:
            codegenPlugins.add('typescript');
            codegenPlugins.add('typescript-urql');
            break;
          case FrontendType.GraphQLRequest:
            codegenPlugins.add('typescript');
            codegenPlugins.add('typescript-graphql-request');
            break;
          case FrontendType.ApolloAndroid:
            codegenPlugins.add('java-apollo-android');
            break;
        }

        const { frontendGeneratedFile } = await prompt([
          {
            type: 'input',
            name: 'frontendGeneratedFile',
            message: 'Where do you want to have generated frontend code?',
            default: './generated-frontend.ts',
          },
        ]);

        context.graphqlConfig.extensions.codegen.generates[frontendGeneratedFile] = {
          plugins: [...codegenPlugins],
        };
      }
      for (const codegenPlugin of codegenPlugins) {
        project.addDependency('@graphql-codegen/' + codegenPlugin);
      }
    }
  }
}
