import { EventEmitter } from 'events'
import * as fs from 'fs'
import { relative } from 'path'
import { printSchema, GraphQLSchema } from 'graphql'
import {
  writeSchema,
  GraphQLConfig,
  GraphQLProjectConfig,
  GraphQLEndpoint,
} from 'graphql-config'
import chalk from 'chalk'
import * as isUrl from 'is-url-superb'
import { Context, noEndpointError, CommandObject } from '..'
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
        },
        header: {
          describe: 'Header to use for downloading (with endpoint URL)',
          type: 'string',
        },
      })
      .implies('console', ['--no-output', '--no-watch'])
      .implies('all', ['--no-output', '--no-endpoint', '--no-project'])
      .implies('--no-endpoint', '--no-header'),

  handler: async (context: Context, argv: Arguments) => {
    if (argv.all) {
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
  if (isUrl(argv.endpoint)) {
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
      throw noEndpointError
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
  console.log({ url: argv.endpoint, headers: endpointHeaders })
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
  const newSchemaResult = argv.json
    ? await endpoint.resolveIntrospection()
    : await endpoint.resolveSchema()

  let oldSchema: string | undefined
  if (!argv.console) {
    try {
      oldSchema = argv.output
        ? fs.readFileSync(argv.output, 'utf-8')
        : config!.getSchemaSDL()
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

  let schemaPath
  if (argv.console) {
    console.log(
      argv.json
        ? JSON.stringify(newSchemaResult, null, 2)
        : printSchema(newSchemaResult as GraphQLSchema),
    )
  } else if (argv.json) {
    schemaPath = argv.output
    fs.writeFileSync(argv.output, JSON.stringify(newSchemaResult, null, 2))
  } else {
    schemaPath = argv.output ? argv.output : config!.schemaPath
    await writeSchema(schemaPath as string, newSchemaResult as GraphQLSchema, {
      source: endpoint.url,
      timestamp: new Date().toString(),
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
