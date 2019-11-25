import { CliPlugin } from "@test-graphql-cli/common";
import { loadSchemaUsingLoaders } from "@graphql-toolkit/core";
import { printSchemaWithDirectives } from "@graphql-toolkit/common";
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GraphQLFileLoader } from '@graphql-toolkit/graphql-file-loader';
import { JsonFileLoader } from '@graphql-toolkit/json-file-loader';
import { UrlLoader } from '@graphql-toolkit/url-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { ensureFile } from 'fs-extra';
import { writeFile as fsWriteFile } from 'fs';
import { join } from 'path';
import { graphQLInputContext, InputModelTypeContext, GraphbackCRUDGeneratorConfig } from "@graphback/core"
import { migrate, DropCreateDatabaseAlways, DatabaseSchemaManager } from "graphql-migrations"
import { createClient, ClientDocuments } from "@graphback/codegen-client"
import { createResolvers, ResolverGeneratorOptions } from "@graphback/codegen-resolvers"
import { createSchema, SchemaGeneratorOptions } from "@graphback/codegen-schema"
import { GeneratedResolvers } from '@graphback/codegen-resolvers/types/api/resolverTypes';
import Listr, { ListrTask } from 'listr';
import { prompt } from 'inquirer';

export interface GenerateConfig {
  folders: {
    model: string;
    schema: string;
    resolvers: string;
    client: string;
    migrations: string;
  };
  graphqlCRUD: GraphbackCRUDGeneratorConfig;
  generator: {
    resolvers: ResolverGeneratorOptions
    schema: SchemaGeneratorOptions
    client: { format: 'ts' | 'gql' }
  }
  db: { database: string; dbConfig: any; };
}

const FormatExtensionMap = {
  'ts': 'ts',
  'js': 'js',
  'gql': 'graphql',
};

export function writeFile(path: string, data: any) {
  return new Promise<void>(async (resolve, reject) => {
    await ensureFile(path);
    fsWriteFile(path, data, err => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  })
}

export function globPromise(glob: string, options: import('glob').IOptions = {}) {
  return new Promise<string[]>(async (resolve, reject) => {
    const { default: globAsync } = await import('glob');
    globAsync(glob, options, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    })
  })
}

export async function createSchemaFile(cwd: string, generatedSchema: string, config: GenerateConfig) {
  const extension = FormatExtensionMap[config.generator.schema.format];
  return writeFile(join(cwd, config.folders.schema, 'generated.' + extension), generatedSchema);
}

export async function createResolversFiles(cwd: string, resolvers: GeneratedResolvers, config: GenerateConfig) {
  const extension = FormatExtensionMap[config.generator.resolvers.format];
  return Promise.all(
    resolvers.types.map(typeResolver =>
      writeFile(join(cwd, config.folders.resolvers, 'generated', typeResolver.name + '.' + extension), typeResolver.output)
    )
  );
}

export async function createBackendFiles(cwd: string, inputContext: InputModelTypeContext[], config: GenerateConfig) {
  const resolvers = createResolvers(inputContext, config.generator.resolvers);
  const schema = createSchema(inputContext, config.generator.schema);

  await Promise.all([
    createSchemaFile(cwd, schema, config),
    createResolversFiles(cwd, resolvers, config)
  ])
}

export async function createFragments(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  const extension = FormatExtensionMap[config.generator.client.format];
  return Promise.all(generated.fragments.map((fragment: any) => writeFile(
    join(cwd, config.folders.client, 'generated', 'fragments', fragment.name + '.' + extension),
    fragment.implementation,
  )));
}

export async function createQueries(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  const extension = FormatExtensionMap[config.generator.client.format];
  return Promise.all(generated.queries.map(query => writeFile(
    join(cwd, config.folders.client, 'generated', 'queries', query.name + '.' + extension),
    query.implementation,
  )));
}

export async function createMutations(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  const extension = FormatExtensionMap[config.generator.client.format];
  return Promise.all(generated.mutations.map(mutation => writeFile(
    join(cwd, config.folders.client, 'generated', 'mutations', mutation.name + '.' + extension),
    mutation.implementation,
  )));
}

export async function createSubscriptions(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  const extension = FormatExtensionMap[config.generator.client.format];
  return Promise.all(generated.subscriptions.map(subscription => writeFile(
    join(cwd, config.folders.client, 'generated', 'subscriptions', subscription.name + '.' + extension),
    subscription.implementation,
  )));
}

export async function createClientFiles(cwd: string, inputContext: InputModelTypeContext[], config: GenerateConfig) {
  const generated = await createClient(inputContext, { output: config.generator.client.format });
  await Promise.all([
    createFragments(cwd, generated, config),
    createQueries(cwd, generated, config),
    createMutations(cwd, generated, config),
    createSubscriptions(cwd, generated, config),
  ]);
}

export async function createDatabaseMigration(schema: string, config: GenerateConfig) {
  const db = new DatabaseSchemaManager(config.db.database, config.db.dbConfig);
  // FIXME move to UpdateDatabaseIfChanges after adding relationships support
  const dbInitialization = new DropCreateDatabaseAlways(config.db.database, db.getConnection());

  return await migrate(schema, dbInitialization);
}

export const plugin: CliPlugin = {
  init({ program, loadConfig, reportError }) {
    program
      .command('generate')
      .option('--db')
      .option('--client')
      .option('--backend')
      .option('--silent')
      .action(async ({
        db, client, backend, silent
      }: { db: boolean, client: boolean, backend: boolean, silent: boolean }) => {
        try {
          const config = await loadConfig({
            extensions: [
              () => ({ name: 'generate' }),
            ]
          });
          const generateConfig: GenerateConfig = await config.extension('generate');

          if (!generateConfig) {
            throw new Error(`You should provide a valid 'generate' config to generate schema from data model`);
          }

          if (!generateConfig.folders) {
            throw new Error(`'generate' config missing 'folders' section that is required`);
          }

          if (!db && !client && !backend) {
            const { selections } = await prompt([
              {
                type: 'checkbox',
                name: 'selections',
                choices: [
                  {
                    value: 'backend',
                    name: 'Backend Schema and Resolvers',
                  },
                  {
                    value: 'client',
                    name: 'Client-Side Operation',
                  }, {
                    value: 'db',
                    name: 'Database Creation and Migration',
                  }
                ]
              }
            ]);
            db = selections.includes('db');
            client = selections.includes('client');
            backend = selections.includes('backend');
          }

          const cwd = config.dirpath;

          const models = await loadSchemaUsingLoaders([
            new UrlLoader(),
            new GraphQLFileLoader(),
            new JsonFileLoader(),
            new CodeFileLoader(),
            new GitLoader(),
            new GithubLoader(),
          ], join(cwd, generateConfig.folders.model + '/**/*.graphql'));

          const schemaString = printSchemaWithDirectives(models);

          const tasks: ListrTask[] = [];

          if (backend || client) {
            // Creates model context that is shared with all generators to provide results
            const inputContext = graphQLInputContext.createModelContext(schemaString, generateConfig.graphqlCRUD)

            if (backend) {
              tasks.push({
                title: 'Generating Backend Schema and Resolvers',
                task: () => createBackendFiles(cwd, inputContext, generateConfig),
              })
            }
            if (client) {
              tasks.push({
                title: 'Generating Client-side Operations',
                task: () => createClientFiles(cwd, inputContext, generateConfig),
              })
            }
          }

          if (db) {
            tasks.push({
              title: 'Running Database Migration',
              task: () => createDatabaseMigration(schemaString, generateConfig),
            })
          }

          const listr = new Listr(tasks, {
            renderer: silent ? 'silent' : 'default',
            // it doesn't stop when one of tasks failed, to finish at least some of outputs
            exitOnError: false,
            // run 4 at once
            concurrent: 4,
          });

          await listr.run();

        } catch (e) {
          reportError(e);
        }
      })
  }
}
