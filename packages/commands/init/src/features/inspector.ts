import { prompt } from 'inquirer';
import { Context, PackageManifest, ProjectType } from '../common';

export async function askForInspector({ context, project }: { context: Context; project: PackageManifest }) {
  if (context.type === ProjectType.FullStack || context.type === ProjectType.FrontendOnly) {
    const { isFrontendInspectorAsked } = await prompt([
      {
        type: 'confirm',
        name: 'isFrontendInspectorAsked',
        message: 'Do you want to have GraphQL Inspector tools for your frontend?',
        default: true,
      },
    ]);

    if (isFrontendInspectorAsked) {
      project.addDependency('@graphql-cli/coverage');
      project.addDependency('@graphql-cli/validate');
    }
  }

  if (context.type === ProjectType.FullStack || context.type === ProjectType.BackendOnly) {
    const { isBackendInspectorAsked } = await prompt([
      {
        type: 'confirm',
        name: 'isBackendInspectorAsked',
        message: 'Do you want to have GraphQL Inspector tools for your backend?',
        default: true,
      },
    ]);

    if (isBackendInspectorAsked) {
      project.addDependency('@graphql-cli/diff');
      project.addDependency('@graphql-cli/serve');
      project.addDependency('@graphql-cli/similar');
    }
  }
}
