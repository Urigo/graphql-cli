import chalk from 'chalk'
import { GraphQLConfig, GraphQLProjectConfig } from 'graphql-config'
import { merge } from 'lodash'
import { Arguments } from 'yargs'
import { spawnSync } from 'npm-run'
import * as crossSpawn from 'cross-spawn'
import { getTmpPath } from '../..'
import * as fs from 'fs'
import {
  graphql,
  introspectionQuery,
  GraphQLSchema,
  ExecutionResult,
} from 'graphql'
// import * as generatorModule from 'graphql-codegen-binding'

export type CodegenConfigs = CodegenConfig[] | CodegenConfig

export interface CodegenConfig {
  input: CodegenInput
  output: CodegenOutput
  language: string
  generator: string
}

export type CodegenInput = CodegenInputObject | string

export interface CodegenInputObject {
  schema: string
  typeDefs: string
}

export interface CodegenOutput {
  binding: string
  typeDefs: string
  typings: string
}

export class Codegen {
  private config: GraphQLConfig
  private projectName: string
  private project: GraphQLProjectConfig

  constructor(private context: any, private argv: Arguments) {}

  public async handle() {
    this.config = await this.context.getConfig()

    // Get projects
    const projects: {
      [name: string]: GraphQLProjectConfig
    } = this.getProjectConfig()

    // if a project has been specified, only process that one project
    if (this.argv.project) {
      if (
        Object.keys(projects).find(project => project === this.argv.project)
      ) {
        const project: GraphQLProjectConfig = projects[this.argv.project]

        this.setCurrentProject(project, this.argv.project)

        this.codegen()
      }
    } else {
      // otherwise process all project provided in the graphql config
      for (const projectName of Object.keys(projects)) {
        const project: GraphQLProjectConfig = projects[projectName]

        this.setCurrentProject(project, projectName)

        await this.codegen()
      }
    }
  }

  private setCurrentProject(
    project: GraphQLProjectConfig,
    projectName: string,
  ): void {
    this.project = project
    this.projectName = projectName
  }

  private async codegen() {
    if (
      this.project.config.extensions &&
      this.project.config.extensions.codegen
    ) {
      this.context.spinner.start(
        `Generating bindings for project ${this.projectDisplayName()}...`,
      )

      const codegenConfigs: CodegenConfig[] = Array.isArray(
        this.project.config.extensions.codegen,
      )
        ? this.project.config.extensions.codegen
        : [this.project.config.extensions.codegen]

      for (const codegenConfig of codegenConfigs) {
        const { output, input, generator, language } = codegenConfig
        let inputSchemaPath =
          this.getInputSchemaPath(input) || this.project.schemaPath

        if (!inputSchemaPath && generator !== 'typegen') {
          throw new Error(
            `Please either provide a 'schemaPath' or 'input' for the codegen extension in your .graphqlconfig`,
          )
        }

        if (!output) {
          throw new Error(
            `Please specify the 'output' of the codegen extension in your .graphqlconfig`,
          )
        }

        if (!generator) {
          throw new Error(
            `Please specify the 'generator' of codegen extension in your .graphqlconfig`,
          )
        }

        if (!language) {
          throw new Error(
            `Please specify the 'language' of the codegen extension in your .graphqlconfig`,
          )
        }

        if (generator === 'typegen') {

          if (!output.typings || output.typings === '') {
            throw new Error("Please provide output.typings path in graphql config to use typegen")
          }

          inputSchemaPath = inputSchemaPath || '**/*.ts'
          const binPath = require.resolve('apollo-codegen').replace('index.js', 'cli.js')
          const tmpSchemaPath = getTmpPath()
          fs.writeFileSync(
            tmpSchemaPath,
            JSON.stringify(await introspect(this.project.getSchema())),
          )
          const args = [
            'generate',
            input || '{binding,prisma}/*.ts',
            '--schema',
            tmpSchemaPath,
            '--output',
            output.typings,
            '--target',
            language,
          ]

          const child = crossSpawn.sync(binPath, args)
        
          if (child.error) {
            if (child.error.message === `spawnSync apollo-codegen ENOENT`) {
              throw new Error(`Generator apollo-codegen is not installed.`)
            }
            throw new Error(child.error.message)
          }

          const stderr = child.stderr && child.stderr.toString()
          if (stderr && stderr.length > 0) {
            throw new Error(child.stderr.toString())
          }
          this.context.spinner.succeed(
            `Typedefs for project ${this.projectDisplayName()} generated to ${chalk.green(
              output.typings,
            )}`,
          )
          // fs.unlinkSync(tmpSchemaPath)
        } else {
          const args = ['--input', inputSchemaPath, '--language', language]

          if (!output.binding || output.binding === '' && !output.typeDefs || output.typeDefs === '') {
            throw new Error("Please provide either output.binding or output.typeDefs in graphql config to use this generator")
          }

          if (output.binding) {
            args.push('--outputBinding', output.binding)
          }
          if (output.typeDefs) {
            args.push('--outputTypedefs', output.typeDefs)
          }
          const child = spawnSync(generator, args)

          if (child.error) {
            if (child.error.message === `spawnSync ${generator} ENOENT`) {
              const prismaVersionMessage = generator === 'prisma-binding' || 'graphql-binding' ? 
              `Please install ${generator} version > 2.x to use "graphql codegen"` : ''
              throw new Error(`Generator ${generator} is not installed. ${prismaVersionMessage}`)
            }
            throw new Error(child.error.message)
          }

          const stderr = child.stderr && child.stderr.toString()
          if (stderr && stderr.length > 0) {
            throw new Error(stderr)
          }

          this.context.spinner.succeed(
            `Code for project ${this.projectDisplayName()} generated to ${chalk.green(
              output.binding,
            )}${
              output.typeDefs
                ? `. Typedefs written to ${chalk.green(output.typeDefs)}`
                : ''
            }`,
          )
        }
      }
    } else if (this.argv.verbose) {
      this.context.spinner.info(
        `Codegen not configured for project ${this.projectDisplayName()}. Skipping`,
      )
    }
  }

  private getInputSchemaPath(input?: CodegenInput) {
    if (!input) {
      return null
    }

    if (typeof input === 'string') {
      return input
    }

    return input.schema
  }

  private getProjectConfig(): { [name: string]: GraphQLProjectConfig } {
    let projects: { [name: string]: GraphQLProjectConfig } | undefined
    if (this.argv.project) {
      if (Array.isArray(this.argv.project)) {
        projects = {}
        this.argv.project.map((p: string) =>
          merge(projects, { [p]: this.config.getProjectConfig(p) }),
        )
      } else {
        // Single project mode
        projects = {
          [this.argv.project]: this.config.getProjectConfig(this.argv.project),
        }
      }
    } else {
      // Process all projects
      projects = this.config.getProjects()
    }

    return projects || { default: this.config.getProjectConfig() }
  }

  private projectDisplayName = () => chalk.green(this.projectName)
}

export function introspect(schema: GraphQLSchema): Promise<ExecutionResult> {
  return graphql(schema, introspectionQuery)
}
