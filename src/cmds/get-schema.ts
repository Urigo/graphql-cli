export const command = 'get-schema [endpoint]'
export const desc = 'Download schema from endpoint'
export const builder = {
  watch: {
    alias: 'w',
    boolean: true,
    description: 'watch server for schema changes and update local schema',
  },
}

import { existsSync } from 'fs'
import { relative } from 'path'
import { printSchema } from 'graphql'
import { writeSchema } from 'graphql-config'
import * as chalk from 'chalk'

import { Context, noEndpointError } from '../'

export async function handler (context: Context, argv: {endpoint: string, watch: boolean}) {
  if (argv.watch) {
    const spinner = context.spinner
    // FIXME: stop spinner on errors
    spinner.start()
    const spinnerLog = msg => spinner.text = msg

    while (true) {
      try {
        const isUpdated = await update(spinnerLog)
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
  } else {
    return await update(console.log)
  }

  async function update (log: (message: string) => void) {
    const config = context.getProjectConfig()
    if (!config.endpointsExtension) {
      throw noEndpointError
    }
    const endpoint = config.endpointsExtension.getEndpoint(argv.endpoint)

    log(`Downloading introspection from ${chalk.blue(endpoint.url)}`)
    const newSchema = await endpoint.resolveSchema()

    let oldSchemaSDL: string | undefined
    try {
      oldSchemaSDL = config.getSchemaSDL()
    } catch (e) {
      // ignore error if no previous schema file existed
      if (e.code !== 'ENOENT') {
        throw e
      }
    }
    if (oldSchemaSDL) {
      const newSchemaSDL = printSchema(newSchema)
      if (newSchemaSDL === oldSchemaSDL) {
        log(chalk.green('No changes'))
        return false
      }
    }

    const schemaPath = relative(process.cwd(), config.schemaPath as string)
    await writeSchema(config.schemaPath as string, newSchema, {
      source: endpoint.url,
      timestamp: (new Date()).toString(),
    })

    const existed = existsSync(schemaPath)
    log(chalk.green(`Schema file was ${existed ? 'updated' : 'created'}: ${chalk.blue(schemaPath)}`))
    return true
  }
}

function wait (interval: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval)
  })
}
