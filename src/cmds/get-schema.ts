export const command = 'get-schema [endpointName]'
export const desc = 'Download GraphQL schema'
export const builder = {
  watch: {
    alias: 'w',
    boolean: true,
  }
}

import { existsSync } from 'fs'
import { relative } from 'path'
import { printSchema } from 'graphql'
import { writeSchema } from 'graphql-config'

export async function handler(context, argv) {
  if (argv.watch) {
    const spinner = context.spinner
    // FIXME: stop spinner on errors
    spinner.start()
    const spinnerLog = msg => spinner.text = msg

    while (true) {
      const isUpdated = await update(spinnerLog)
      if (isUpdated) {
        spinner.stop()
        console.log(spinner.text)
        spinner.start()
        spinner.text = 'Updated!'
      } else {
        spinner.text = 'No changes.'
      }

      spinner.text += ' Next update in 10s.'
      await wait(10000)
    }
  } else {
    return await update(console.log)
  }

  async function update(log) {
    const config = context.getConfig()
    const endpoint = config.endpointExtension.getEndpoint(argv.endpointName)

    log(`Downloading introspection from ${endpoint.url}`)
    const newSchema = await endpoint.resolveSchema(argv.endpointName)

    try {
      const oldSchemaSDL = config.getSchemaSDL()
      const newSchemaSDL = printSchema(newSchema)
      if (newSchemaSDL === oldSchemaSDL) {
         log('No changes')
         return false
      }
    } catch (_) {
    }

    const schemaPath = relative(process.cwd(), config.schemaPath)
    await writeSchema(config.schemaPath, newSchema)
    const existed = existsSync(schemaPath)
    log(`Schema file was ${existed ? 'updated' : 'created'} ${schemaPath}`)
    return true
  }
}

function wait(interval: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), interval);
  })
}
