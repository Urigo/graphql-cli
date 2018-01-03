import { EventEmitter } from 'events'
import * as fs from 'fs'
import { relative } from 'path'
import { printSchema, GraphQLSchema } from 'graphql'
import { writeSchema, GraphQLConfig, GraphQLProjectConfig, GraphQLEndpoint } from 'graphql-config'
import chalk from 'chalk'

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
          describe: 'Output to console',
          default: false
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
        if (!argv.console) { console.log(spinner.text) }
        spinner.start()
      })
      emitter.on('error', err => {
        spinner.fail(chalk.red(err.message))
      })
      start()
      await updateWrapper(context, argv)
      spinner.stop()
    }

    if (argv.watch) {
      let handle
      emitter.on('checked', () => {
        spinner.stop()
        console.log(`[${new Date().toTimeString().split(' ')[0]}] ${spinner.text}`)
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
  }
}

async function updateWrapper(context: Context, argv: Arguments) {
  try {
    await update(context, argv)
  } catch (err) {
    emitter.emit('error', err)
  }
}

async function update(context: Context, argv: Arguments) {
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

async function updateSingleProjectEndpoint(
  config: GraphQLProjectConfig,
  endpoint: GraphQLEndpoint,
  endpointName: string,
  argv: Arguments
): Promise<void> {
  log(`Downloading introspection from ${chalk.blue(endpoint.url)}`)
  const newSchemaResult = argv.json
    ? await endpoint.resolveIntrospection()
    : await endpoint.resolveSchema()

  if (!argv.console) {
    let oldSchema: string | undefined
    try {
      oldSchema = argv.json ? fs.readFileSync(argv.output, 'utf-8') : config.getSchemaSDL()
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
            `No changes${config.projectName && config.projectName !== 'unnamed' ? ` - project ${chalk.white(config.projectName)}` : ''}${
              endpointName && endpointName !== 'unnamed' ? ` - endpoint ${chalk.white(endpointName)}` : ''
            }`
          )
        )
        emitter.emit('checked')
        return
      }
    }
  }

  const schemaPath = argv.json ? argv.output : relative(process.cwd(), config.schemaPath as string)
  if (argv.console) {
    console.log(
      argv.json
        ? JSON.stringify(newSchemaResult, null, 2)
        : printSchema(newSchemaResult as GraphQLSchema)
    )
  } else if (argv.json) {
    fs.writeFileSync(schemaPath, JSON.stringify(newSchemaResult, null, 2))
  } else {
    await writeSchema(config.schemaPath as string, newSchemaResult as GraphQLSchema, {
      source: endpoint.url,
      timestamp: new Date().toString()
    })
  }

  const existed = fs.existsSync(schemaPath)
  log(chalk.green(`Schema file was ${existed ? 'updated' : 'created'}: ${chalk.blue(schemaPath)}`))
  emitter.emit('checked')
}

async function getProjectConfig(context: Context, argv: Arguments): Promise<{ [name: string]: GraphQLProjectConfig }> {
  const config: GraphQLConfig = await context.getConfig()
  let projects: { [name: string]: GraphQLProjectConfig } | undefined
  if (argv.project) {
    if (Array.isArray(argv.project)) {
      projects = {}
      argv.project.map((p: string) => merge(projects, { [p]: config.getProjectConfig(p) }))
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

function getEndpoints(config: GraphQLProjectConfig, argv: Arguments): { [name: string]: GraphQLEndpoint } {
  let endpoints: { [name: string]: GraphQLEndpoint } | undefined
  if (argv.endpoint) {
    if (Array.isArray(argv.endpoint)) {
      endpoints = {}
      argv.endpoint.map((e: string) => merge(endpoints, { [e]: config.endpointsExtension!.getEndpoint(e) }))
    } else if (argv.endpoint === '*') {
      endpoints = Object.keys(config.endpointsExtension!.getRawEndpointsMap()).reduce((total, current) => {
        merge(total, { [current]: config.endpointsExtension!.getEndpoint(current) })
        return total
      }, {})
    } else {
      endpoints = { [argv.endpoint]: config.endpointsExtension!.getEndpoint(argv.endpoint) }
    }
  } else {
    endpoints = { unnamed: config.endpointsExtension!.getEndpoint(argv.endpoint) }
  }

  return endpoints
}

export = command
