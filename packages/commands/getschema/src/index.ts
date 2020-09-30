import * as fs from 'fs'
import * as os from 'os'
import * as mkdirp from 'mkdirp'
import { relative, dirname } from 'path'
import { printSchema, GraphQLSchema, buildClientSchema, validateSchema } from 'graphql'
import chalk from 'chalk'
import { Arguments } from 'yargs'

import { defineCommand } from '@graphql-cli/common';

export default defineCommand(() => {
  return {
    command: 'get-schema',
    builder(builder: any) {
      return builder.options({
        endpoint: {
          alias: 'e',
          describe: 'Endpoint name or URL',
          type: 'string',
        },
        json: {
          alias: 'j',
          describe: 'Output as JSON',
          type: 'boolean',
        },
        output: {
          alias: 'o',
          describe: 'Output file name',
          type: 'string',
        },
        console: {
          alias: 'c',
          describe: 'Output to console',
          default: false,
        },
        insecure: {
          alias: 'i',
          describe: 'Allow insecure (self-signed) certificates',
          type: 'boolean',
        },
        header: {
          describe:
            'Header to use for downloading (with endpoint URL). Format: Header=Value',
          type: 'string',
        },
      });
    },
    handler,
  };
});

const handler = async (args: any) => {
  if (args.endpoint) {
    args.all = false
  }

  if (args.all && !args.project) {
    args.project = args.endpoint = '*'
  }

  if (args.insecure) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }

  if (!args.watch) {
    await updateWrapper(args)
  }
}

async function updateWrapper(argv: any) {
  try {
    await update(argv)
  } catch (err) {
    console.error(err)
  }
}

async function update(argv: Arguments) {
  if (argv.endpoint) {
    if (argv.output || argv.console) {
      await downloadFromEndpointUrl(argv)
      return
    } else {
      console.log('No output file specified!');
    }
  }
}

async function downloadFromEndpointUrl(argv: Arguments) {
  const endpointHeaders = {}
  if (argv.header) {
    const headers = Array.isArray(argv.header) ? argv.header : [argv.header]
    Object.assign(
      endpointHeaders,
      ...headers.map(h => ({ [h.split('=')[0]]: h.split('=')[1] })),
    )
  }

  const endpoint = {
    url: argv.endpoint,
    headers: endpointHeaders,
  }

  await updateSingleProjectEndpoint(endpoint, argv)
}

async function updateSingleProjectEndpoint(
  endpoint: { url: string, headers: string[] },
  argv: Arguments,
): Promise<void> {
  console.info(`Downloading introspection from ${chalk.blue(endpoint.url)}`)
  let newSchemaResult
  try {
    newSchemaResult = argv.json
      // TODO figure out how to resolve it using graphql-tools
      ? await endpoint.resolveIntrospection()
      : await endpoint.resolveSchema()

    // Do not save an invalid schema
    const clientSchema = argv.json
      ? buildClientSchema(newSchemaResult)
      : newSchemaResult
    const errors = validateSchema(clientSchema)
    if (errors.length > 0) {
      console.error(chalk.red(`${os.EOL}GraphQL endpoint generated invalid schema: ${errors}`))
      setTimeout(() => {
        process.exit(1)
      }, 500)
      return
    }
  } catch (err) {
    console.log('warning', err.message)
    return
  }

  let oldSchema: string | undefined
  if (!argv.console) {
    try {
      oldSchema = argv.output
        ? fs.readFileSync(argv.output as string, 'utf-8') : ""
    } catch (e) {
      // ignore error if no previous schema file existed
      if (e.message === 'Unsupported schema file extention. Only ".graphql" and ".json" are supported') {
        console.error(e.message)
        setTimeout(() => {
          process.exit(1)
        }, 500)
      }
      // TODO: Add other non-blocking errors to this list
      if (e.message.toLowerCase().indexOf('syntax error') > -1) {
        console.log(`${os.EOL}Ignoring existing schema because it is invalid: ${chalk.red(e.message)}`)
      } else if (e.code !== 'ENOENT') {
        throw e
      }
    }

    if (oldSchema) {
      const newSchema = argv.json
        ? JSON.stringify(newSchemaResult, null, 2)
        : printSchema(newSchemaResult as GraphQLSchema)
      if (newSchema === oldSchema) {
        console.log(
          chalk.green(
            `No changes in schema`,
          ),
        )
        return
      }
    }
  }

  let schemaPath: any = argv.output
  if (argv.console) {
    console.log(
      argv.json
        ? JSON.stringify(newSchemaResult, null, 2)
        : printSchema(newSchemaResult as GraphQLSchema),
    )
  } else if (argv.json) {
    if (!fs.existsSync(schemaPath)) {
      mkdirp.sync(dirname(schemaPath))
    }
    fs.writeFileSync(argv.output as any, JSON.stringify(newSchemaResult, null, 2))
  } else {
    console.info("No output provided. Using JSON");
    if (!fs.existsSync(schemaPath)) {
      mkdirp.sync(dirname(schemaPath))
    }
    fs.writeFileSync(argv.output as any, JSON.stringify(newSchemaResult, null, 2))
  }

  if (schemaPath) {
    console.log(
      chalk.green(
        `Schema file was ${oldSchema ? 'updated' : 'created'}: ${chalk.blue(
          relative(process.cwd(), schemaPath),
        )}`,
      ),
    )
  }
}