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
  }
  db: { database: string; dbConfig: any; };
}

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
  return writeFile(join(cwd, config.folders.schema, 'generated.ts'), generatedSchema);
}

export async function createResolversFiles(cwd: string, resolvers: GeneratedResolvers, config: GenerateConfig) {
  return Promise.all([
    Promise.all(
      resolvers.custom.map(customResolver =>
        writeFile(join(cwd, config.folders.resolvers, 'custom', customResolver.name + '.ts'), customResolver.output)
      )
    ),
    Promise.all(
      resolvers.types.map(typeResolver =>
        writeFile(join(cwd, config.folders.resolvers, 'generated', typeResolver.name + '.ts'), typeResolver.output)
      )
    ),
    writeFile(join(cwd, config.folders.resolvers, 'index.ts'), resolvers.index)
  ]
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
  return Promise.all(generated.fragments.map((fragment: any) => writeFile(
    join(cwd, config.folders.client, 'generated', 'fragments', fragment.name + '.ts'),
    fragment.implementation,
  )));
}

export async function createQueries(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  return Promise.all(generated.queries.map(query => writeFile(
    join(cwd, config.folders.client, 'generated', 'queries', query.name + '.ts'),
    query.implementation,
  )));
}

export async function createMutations(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  return Promise.all(generated.mutations.map(mutation => writeFile(
    join(cwd, config.folders.client, 'generated', 'mutations', mutation.name + '.ts'),
    mutation.implementation,
  )));
}

export async function createSubscriptions(cwd: string, generated: ClientDocuments, config: GenerateConfig) {
  return Promise.all(generated.subscriptions.map(subscription => writeFile(
    join(cwd, config.folders.client, 'generated', 'subscriptions', subscription.name + '.ts'),
    subscription.implementation,
  )));
}

export async function createClientFiles(cwd: string, inputContext: InputModelTypeContext[], config: GenerateConfig) {
  const generated = await createClient(inputContext, { output: 'ts' });
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
      .action(async ({
        db, client, backend
      }: { db: boolean, client: boolean, backend: boolean }) => {
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

          if (!db && !client) {
            backend = true;
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

          if (backend || client) {
            // Creates model context that is shared with all generators to provide results
            const inputContext = graphQLInputContext.createModelContext(schemaString, generateConfig.graphqlCRUD)
  
            if (backend) {
              await createBackendFiles(cwd, inputContext, generateConfig);
            }
            if (client) {
              await createClientFiles(cwd, inputContext, generateConfig);
            }
          }
          
          if (db) {
            await createDatabaseMigration(schemaString, generateConfig);
          }

        } catch (e) {
          reportError(e);
        }
      })
  }
}
