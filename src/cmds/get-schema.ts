import * as fs from 'fs'
import { relative } from 'path'
import { printSchema, GraphQLSchema } from 'graphql'
import { writeSchema } from 'graphql-config'
import chalk from 'chalk'

import { Context, noEndpointError, CommandObject } from '..'
import { Argv, CommandModule, Arguments } from 'yargs'

const command: CommandObject = {
  command: 'get-schema',
  describe: 'Download schema from endpoint',

  builder: args =>
    args
      .options({
        watch: {
          alias: 'w',
          boolean: true,
          description: 'watch server for schema changes and update local schema'
        },
        endpoint: {
          alias: 'e',
          describe: 'Endpoint name',
          type: 'string'
        },
        json: {
          alias: 'j',
          describe: 'Output as JSON',
          type: 'boolean'
        },
        output: {
          alias: 'o',
          describe: 'Output file name',
          type: 'string'
        },
        console: {
          alias: 'c',
          describe: 'Output to console'
        },
        insecure: {
          alias: 'i',
          describe: 'Allow insecure (self-signed) certificates',
          type: 'boolean'
        }
      })
      .implies('console', ['--no-output', '--no-watch'])
      .implies('--no-json', '--no-output'),

  handler: async (context: Context, argv: Arguments) => {
    if (argv.insecure) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    if (!argv.watch) {
      return update(context, argv, console.log)
    }

    if (argv.watch) {
      const spinner = context.spinner
      // FIXME: stop spinner on errors
      spinner.start()
      const spinnerLog = msg => (spinner.text = msg)

      while (true) {
        try {
          const isUpdated = await update(context, argv, spinnerLog)
          if (isUpdated) {
            spinner.stop()
            console.log(spinner.text)
            spinner.start()
            spinner.text = 'Updated!'
          } else {
            spinner.text = 'No changes.'
          }
        } catch (err) {
          spinner.stop()
          console.error(chalk.red(err.message))
          spinner.start()
          spinner.text = 'Error.'
        }

        spinner.text += ' Next update in 10s.'
        await wait(10000)
      }
    }
  }
}

async function update(context: Context, argv: Arguments, log: (message: string) => void) {
  const config = context.getProjectConfig()
  if (!config.endpointsExtension) {
    throw noEndpointError
  }
  const endpoint = config.endpointsExtension.getEndpoint(argv.endpoint)

  if (!argv.console) {
    log(`Downloading introspection from ${chalk.blue(endpoint.url)}`)
  }
  const newSchemaResult = argv.json
    ? await endpoint.resolveIntrospection()
    : await endpoint.resolveSchema()

  let oldSchema: string | undefined
  if (!argv.console) {
    try {
      oldSchema = argv.json
        ? fs.readFileSync(argv.output, 'utf-8')
        : config.getSchemaSDL()
    } catch (e) {
      // ignore error if no previous schema file existed
      if (e.code !== 'ENOENT') {
        throw e
      }
    }
    if (oldSchema) {
      const newSchema = argv.json
        ? JSON.stringify(newSchemaResult, null, 2)
        : printSchema(newSchemaResult as GraphQLSchema)
      if (newSchema === oldSchema) {
        log(chalk.green('No changes'))
        return false
      }
    }
  }

  const schemaPath = argv.json
    ? argv.output
    : relative(process.cwd(), config.schemaPath as string)
  if (argv.console) {
    console.log(
      argv.json
        ? JSON.stringify(newSchemaResult, null, 2)
        : printSchema(newSchemaResult as GraphQLSchema)
    )
  } else if (argv.json) {
    fs.writeFileSync(schemaPath, JSON.stringify(newSchemaResult, null, 2))
  } else {
    await writeSchema(
      config.schemaPath as string,
      newSchemaResult as GraphQLSchema,
      {
        source: endpoint.url,
        timestamp: new Date().toString()
      }
    )
  }

  if (!argv.console) {
    const existed = fs.existsSync(schemaPath)
    log(
      chalk.green(
        `Schema file was ${existed ? 'updated' : 'created'}: ${chalk.blue(
          schemaPath
        )}`
      )
    )
  }

  return true
}

function wait(interval: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval)
  })
}

export = command
