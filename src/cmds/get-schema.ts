import { EventEmitter } from 'events'
import * as fs from 'fs'
import * as os from 'os'
import * as mkdirp from 'mkdirp'
import { relative, dirname } from 'path'
import { printSchema, GraphQLSchema, buildClientSchema, validateSchema } from 'graphql'
import {
  writeSchema,
  GraphQLConfig,
  GraphQLProjectConfig,
  GraphQLEndpoint,
} from 'graphql-config'
import chalk from 'chalk'
import * as isUrl from 'is-url-superb'
import { Context, CommandObject } from '..'
import { Arguments } from 'yargs'
import { merge } from 'lodash'

const emitter = new EventEmitter()
let log: (text) => void
let start: (text?) => void

const command: CommandObject = {
  command: 'get-schema',
  describe: 'Download schema from endpoint',

  builder: args =>
    args
      .options({
        watch: {
          alias: 'w',
          boolean: true,
          description:
            'watch server for schema changes and update local schema',
        },
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
        all: {
          describe: 'Get schema for all projects and all endpoints',
          type: 'boolean',
          default: true,
        },
        header: {
          describe:
            'Header to use for downloading (with endpoint URL). Format: Header=Value',
          type: 'string',
        },
        source: {
          describe: 'Avoid to print the source url',
          type: 'boolean',
          default: true,
        },
        timestamp: {
          describe: 'Avoid to print the timestamp',
          type: 'boolean',
          default: true,
        },
      })
      .implies('console', ['--no-output', '--no-watch'])
      .implies('json', 'output')
      .implies('--no-endpoint', '--no-header'),

  handler: async (context: Context, argv: Arguments) => {
    if (argv.endpoint) {
      argv.all = false
    }

    if (argv.all && !argv.project) {
      argv.project = argv.endpoint = '*'
    }
    const spinner = context.spinner

    start = text => {
      if (!argv.console) {
        context.spinner.start(text)
      }
    }
    log = text => {
      if (!argv.console) {
        context.spinner.text = text
      }
    }

    if (argv.insecure) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    if (!argv.watch) {
      emitter.on('checked', () => {
        spinner.stop()
        if (!argv.console) {
          console.log(spinner.text)
        }
        spinner.start()
      })
      emitter.on('error', err => {
        if (process.env.DEBUG === '*') {
          throw err
        } else {
          spinner.fail(chalk.red(err.message))
        }
      })
      emitter.on('warning', message => {
        spinner.warn(chalk.yellow(message))
      })

      start()
      await updateWrapper(context, argv)
      spinner.stop()
    }

    if (argv.watch) {
      let handle
      emitter.on('checked', () => {
        spinner.stop()
        console.log(
          `[${new Date().toTimeString().split(' ')[0]}] ${spinner.text}`,
        )
        spinner.start('Next update in 10s...')
      })

      emitter.on('error', err => {
        spinner.fail(chalk.red(err.message))
        clearInterval(handle)
      })
      emitter.on('warning', message => {
        spinner.warn(chalk.yellow(message))
      })

      updateWrapper(context, argv)
      spinner.start()
      handle = setInterval(updateWrapper, 10000, context, argv)
    }
  },
}

async function updateWrapper(context: Context, argv: Arguments) {
  try {
    await update(context, argv)
  } catch (err) {
    emitter.emit('error', err)
  }
}

async function update(context: Context, argv: Arguments) {
  if (argv.endpoint && isUrl(argv.endpoint)) {
    if (argv.output || argv.console) {
      await downloadFromEndpointUrl(argv)
      return
    } else {
      emitter.emit('error', new Error('No output file specified!'))
    }
  }

  const projects = await getProjectConfig(context, argv)

  for (const projectName in projects) {
    const config = projects[projectName]
    if (!config.endpointsExtension) {
      continue
    }
    const endpoints = getEndpoints(config, argv)
    for (const endpointName in endpoints) {
      const endpoint = endpoints[endpointName]
      await updateSingleProjectEndpoint(config, endpoint, endpointName, argv)
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

  const endpoint = new GraphQLEndpoint({
    url: argv.endpoint,
    headers: endpointHeaders,
  })

  await updateSingleProjectEndpoint(undefined, endpoint, 'unnamed', argv)
}

async function updateSingleProjectEndpoint(
  config: GraphQLProjectConfig | undefined,
  endpoint: GraphQLEndpoint,
  endpointName: string,
  argv: Arguments,
): Promise<void> {
  log(`Downloading introspection from ${chalk.blue(endpoint.url)}`)
  let newSchemaResult
  try {
    newSchemaResult = argv.json
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
    emitter.emit('warning', err.message)
    return
  }

  let oldSchema: string | undefined
  if (!argv.console) {
    try {
      oldSchema = argv.output
        ? fs.readFileSync(argv.output, 'utf-8')
        : config!.getSchemaSDL()
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
        log(
          chalk.green(
            `${
              config && config.projectName && config.projectName !== 'unnamed'
                ? `project ${chalk.blue(config.projectName)} - `
                : ''
            }${
              endpointName && endpointName !== 'unnamed'
                ? `endpoint ${chalk.blue(endpointName)} - `
                : ''
            }No changes`,
          ),
        )
        emitter.emit('checked')
        return
      }
    }
  }

  let schemaPath = argv.output
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
    fs.writeFileSync(argv.output, JSON.stringify(newSchemaResult, null, 2))
  } else {
    schemaPath = schemaPath || config!.schemaPath
    if (!fs.existsSync(schemaPath)) {
      mkdirp.sync(dirname(schemaPath))
    }
    await writeSchema(schemaPath as string, newSchemaResult as GraphQLSchema, {
      ...(argv.source ? { source: endpoint.url } : {}),
      ...(argv.timestamp ? { timestamp: new Date().toString() } : {}),
    })
  }

  if (schemaPath) {
    log(
      chalk.green(
        `${
          config && config.projectName && config.projectName !== 'unnamed'
            ? `project ${chalk.blue(config.projectName)} - `
            : ''
        }${
          endpointName && endpointName !== 'unnamed'
            ? `endpoint ${chalk.blue(endpointName)} - `
            : ''
        }Schema file was ${oldSchema ? 'updated' : 'created'}: ${chalk.blue(
          relative(process.cwd(), schemaPath),
        )}`,
      ),
    )
  }
  emitter.emit('checked')
}

async function getProjectConfig(
  context: Context,
  argv: Arguments,
): Promise<{ [name: string]: GraphQLProjectConfig }> {
  const config: GraphQLConfig = await context.getConfig()
  let projects: { [name: string]: GraphQLProjectConfig } | undefined
  if (argv.project) {
    if (Array.isArray(argv.project)) {
      projects = {}
      argv.project.map((p: string) =>
        merge(projects, { [p]: config.getProjectConfig(p) }),
      )
    } else if (argv.project === '*') {
      projects = config.getProjects()
    } else {
      // Single project mode
      projects = { [argv.project]: config.getProjectConfig(argv.project) }
    }
  } else {
    // Process all projects
    projects = { unnamed: config.getProjectConfig() }
  }

  if (!projects) {
    throw new Error('No projects defined in config file')
  }

  return projects
}

function getEndpoints(
  config: GraphQLProjectConfig,
  argv: Arguments,
): { [name: string]: GraphQLEndpoint } {
  let endpoints: { [name: string]: GraphQLEndpoint } | undefined
  if (argv.endpoint) {
    if (Array.isArray(argv.endpoint)) {
      endpoints = {}
      argv.endpoint.map((e: string) =>
        merge(endpoints, { [e]: config.endpointsExtension!.getEndpoint(e) }),
      )
    } else if (argv.endpoint === '*') {
      endpoints = Object.keys(
        config.endpointsExtension!.getRawEndpointsMap(),
      ).reduce((total, current) => {
        merge(total, {
          [current]: config.endpointsExtension!.getEndpoint(current),
        })
        return total
      }, {})
    } else {
      endpoints = {
        [argv.endpoint]: config.endpointsExtension!.getEndpoint(argv.endpoint),
      }
    }
  } else {
    endpoints = {
      unnamed: config.endpointsExtension!.getEndpoint(argv.endpoint),
    }
  }

  return endpoints
}

export = command
