import { defineCommand } from '@graphql-cli/common';
import { prompt } from 'inquirer';
import { join } from 'path';
import chalk from 'chalk';
import { ensureFile, writeFileSync, readFileSync, existsSync } from 'fs-extra';
import { safeLoad as YAMLParse, safeDump as YAMLStringify } from 'js-yaml';
import { Context, InitializationType, ProjectType, askForEnum, managePackageManifest } from './common';
import { askForInspector } from './features/inspector';
import { askForCodegen } from './features/codegen';
import { fromExisting } from './sources/from-existing';
import { fromScratch } from './sources/from-scratch';
import { fromExistingOpenAPI } from './sources/from-open-api';

export default defineCommand<
  {},
  {
    projectName?: string;
    templateName?: string;
    templateUrl?: string;
  }
>(() => {
  return {
    command: 'init',
    builder(yargs) {
      return yargs.options({
        projectName: {
          describe: 'Project name',
          type: 'string',
        },
        templateName: {
          describe: 'Name of the predefined template',
          type: 'string',
        },
        templateUrl: {
          describe: 'GitHub URL of the template. For example (http://github.com/example/graphql-cli-example-template)',
          type: 'string',
        },
      });
    },
    async handler(args) {
      let { projectName, templateName, templateUrl } = args;
      const initializationType = await askForInitializationType();
      
      const context: Context = {
        name: projectName,
        path: process.cwd(),
        graphqlConfig: {
          extensions: {},
        },
      };

      const project = managePackageManifest();

      project.addDependency('graphql-cli');

      if (initializationType === InitializationType.ExistingGraphQL) {
        await fromExisting({
          context,
          project,
        });
      } else if (initializationType === InitializationType.FromScratch) {
        await fromScratch({
          context,
          templateName,
          templateUrl,
        });
      }

      if (initializationType !== InitializationType.FromScratch) {
        context.type = await askForProject();
      }

      loadGraphQLConfig(context);

      if (initializationType === InitializationType.ExistingOpenAPI) {
        await fromExistingOpenAPI(context);
      }

      await askForSchema(context);
      await askForDocuments(context);
      await askForCodegen({ context, project });
      await askForInspector({ context, project });

      await Promise.all([
        writeGraphQLConfig(context),
        project.writePackage({
        path: context.path,
        name: projectName,
        initializationType,
      })]);

      const successMessages = [
        `🚀  GraphQL CLI project successfully initialized:`,
        context.name,
        'Next Steps:',
        `- Change directory to the project folder - ${chalk.cyan(`cd ${context.path}`)}`,
        `- Run ${chalk.cyan(`yarn install`)} to install dependencies`,
      ];

      if (initializationType !== InitializationType.ExistingGraphQL) {
        successMessages.push(
          `- ${chalk.cyan(`(Optional)`)} Initialize your git repo. ${chalk.cyan(`git init`)}.`,
          `- Follow the instructions in README.md to continue...`
        );
      }

      console.info(successMessages.join('\n'));
      process.exit(0);
    },
  };
});

function askForProject() {
  return askForEnum({
    enum: ProjectType,
    message: 'What is the type of the project?',
    defaultValue: ProjectType.FullStack,
  });
}

function askForInitializationType() {
  return askForEnum({
    enum: InitializationType,
    message: 'Select the best option for you',
    defaultValue: InitializationType.FromScratch,
    ignoreList: [],
  });
}

function loadGraphQLConfig(context: Context) {
  const graphqlConfigPath = join(context.path, '.graphqlrc.yml');

  try {
    if (existsSync(graphqlConfigPath)) {
      context.graphqlConfig = YAMLParse(readFileSync(graphqlConfigPath, 'utf8'));
    }
  } catch (e) {
    console.warn(`Existing GraphQL Config file looks broken! Skipping...`);
  }
}

async function askForSchema(context: Context) {
  if (!context.graphqlConfig.schema) {
    const { schema } = await prompt([
      {
        type: 'input',
        name: 'schema',
        message: 'Where is your schema?',
        default: './schema.graphql',
      },
    ]);

    context.graphqlConfig.schema = schema.endsWith('.ts')
      ? {
          [schema]: {
            require: 'ts-node/register',
          },
        }
      : schema;
  }
}

async function askForDocuments(context: Context) {
  if (
    !context.graphqlConfig.documents &&
    (context.type === ProjectType.FullStack || context.type === ProjectType.FrontendOnly)
  ) {
    const { documents } = await prompt([
      {
        type: 'input',
        name: 'documents',
        message: 'Where are your operation documents?',
      },
    ]);
    context.graphqlConfig.documents = documents;
  }
}

async function writeGraphQLConfig(context: Context) {
  const configPath = join(context.path, '.graphqlrc.yml');
  await ensureFile(configPath);

  const keys = ['schema', 'documents', 'extensions'];

  function sortKeys(a: string, b: string) {
    const ai = keys.indexOf(a);
    const bi = keys.indexOf(b);

    if (ai === -1 && bi === -1) {
      return a.localeCompare(b);
    }

    return ai <= bi ? -1 : 1;
  }

  writeFileSync(
    configPath,
    YAMLStringify(context.graphqlConfig, {
      sortKeys,
    })
  );
}
