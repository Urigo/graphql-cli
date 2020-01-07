import { CliPlugin } from "@test-graphql-cli/common";
import { CodeFileLoader } from '@graphql-toolkit/code-file-loader';
import { GitLoader } from '@graphql-toolkit/git-loader';
import { GithubLoader } from '@graphql-toolkit/github-loader';
import { ApolloEngineLoader } from '@graphql-toolkit/apollo-engine-loader';
import { PrismaLoader } from '@graphql-toolkit/prisma-loader';
import { ensureFile } from 'fs-extra';
import { writeFile as fsWriteFile } from 'fs';
import { join } from 'path';
import { graphQLInputContext, InputModelTypeContext, GraphbackCRUDGeneratorConfig } from "@graphback/core"
import { migrateDB } from "graphql-migrations"
import { createClient, ClientDocuments } from "@graphback/codegen-client"
import { createResolvers, ResolverGeneratorOptions } from "@graphback/codegen-resolvers"
import { createSchema, SchemaGeneratorOptions } from "@graphback/codegen-schema"
import { GeneratedResolvers } from '@graphback/codegen-resolvers/types/api/resolverTypes';
import Listr, { ListrTask } from 'listr';
import { prompt } from 'inquirer';
import chokidar from 'chokidar';
import debounce from 'debounce';
import { GraphQLExtensionDeclaration } from 'graphql-config';
import { print } from 'graphql';

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
  const dbConfig = {
    client: config.db.database,
    connection: config.db.dbConfig,
  };

  await migrateDB(dbConfig, schema);
}

interface CliFlags {
  db: boolean, client: boolean, backend: boolean, silent: boolean, watch: boolean
}

export const runGeneration = async ({db, client, backend, silent }: CliFlags, cwd: string, generateConfig: GenerateConfig, schemaString: string) => {

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
}

const GenerateExtension: GraphQLExtensionDeclaration = api => {
  // Schema
  api.loaders.schema.register(new CodeFileLoader());
  api.loaders.schema.register(new GitLoader());
  api.loaders.schema.register(new GithubLoader());
  api.loaders.schema.register(new ApolloEngineLoader());
  api.loaders.schema.register(new PrismaLoader());

  return {
    name: 'generate'
  };
};

export const plugin: CliPlugin = {
  init({ program, loadProjectConfig, reportError }) {
    program
      .command('generate')
      .option('--db')
      .option('--client')
      .option('--backend')
      .option('--silent')
      .option('-w, --watch', 'Watch for changes and execute generation automatically')
      .action(async (cliFlags: CliFlags) => {
        try {
          const config = await loadProjectConfig({
            extensions: [GenerateExtension]
          });
          const generateConfig: GenerateConfig = await config.extension('generate');

          if (!generateConfig) {
            throw new Error(`You should provide a valid 'generate' config to generate schema from data model`);
          }

          if (!generateConfig.folders) {
            throw new Error(`'generate' config missing 'folders' section that is required`);
          }

          if (!cliFlags.db && !cliFlags.client && !cliFlags.backend) {
            const { selections } = await prompt([
              {
                type: 'checkbox',
                name: 'selections',
                message: 'What do you want to generate?',
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
            cliFlags.db = selections.includes('db');
            cliFlags.client = selections.includes('client');
            cliFlags.backend = selections.includes('backend');
            
          }

          const debouncedExec = debounce(async () => {
            try {
              const schemaDocument = await config.loadSchema(join(config.dirpath, generateConfig.folders.model + '/**/*.graphql'), 'DocumentNode');
              const schemaString = print(schemaDocument);
              await runGeneration(cliFlags, config.dirpath, generateConfig, schemaString);
            } catch(e) {
              reportError(e);
            }
            console.info('Watching for changes...');
          }, 100);

          if (cliFlags.watch) {
            chokidar.watch(generateConfig.folders.model, {
              persistent: true,
              cwd: config.dirpath,
            }).on('all', debouncedExec);
          } else {
            const schemaDocument = await config.loadSchema(join(config.dirpath, generateConfig.folders.model + '/**/*.graphql'), 'DocumentNode');
            const schemaString = print(schemaDocument);
            await runGeneration(cliFlags, config.dirpath, generateConfig, schemaString);
            process.exit(0);
          }

        } catch (e) {
          reportError(e);
        }
      })
  }
}
