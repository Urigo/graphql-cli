import ora from 'ora';
import { safeLoad as YAMLParse } from 'js-yaml';
import { readFileSync, writeFileSync, ensureFile } from 'fs-extra';
import { prompt } from 'inquirer';
import { Context } from '../common';

export async function fromExistingOpenAPI(context: Context) {
  const { openApiPath } = await prompt<{ openApiPath: string }>([
    {
      type: 'input',
      name: 'openApiPath',
      message: 'Enter your OpenAPI schema path',
      default: './swagger.json',
    },
  ]);

  const processingOpenAPISpinner = ora(`Processing OpenAPI definition: ${openApiPath}`).start();
  const schemaText: string = readFileSync(`${openApiPath}`, 'utf8');

  const parsedObject =
    openApiPath.endsWith('yaml') || openApiPath.endsWith('yml') ? YAMLParse(schemaText) : JSON.parse(schemaText);

  const datamodelPath = `${context.graphqlConfig.extensions.graphback.model}/datamodel.graphql`;

  try {
    const { createGraphQLSchema } = await import('openapi-to-graphql');
    const { schema } = await createGraphQLSchema(parsedObject, {
      strict: true,
      fillEmptyResponses: true,
      equivalentToMessages: false,
    });
    const { printSchema } = await import('graphql');
    const schemaString = printSchema(schema);

    await ensureFile(datamodelPath);

    writeFileSync(datamodelPath, schemaString);
    processingOpenAPISpinner.succeed();
  } catch (err) {
    processingOpenAPISpinner.fail(`Failed to process OpenAPI definition: ${datamodelPath}. Error: ${err}`);
  }
}
