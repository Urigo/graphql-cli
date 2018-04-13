import chalk from 'chalk'
import { GraphQLConfig, GraphQLProjectConfig } from 'graphql-config'
import { get, has, merge } from 'lodash'
import { Arguments } from 'yargs'
import * as resolve from 'resolve'
// import * as generatorModule from 'graphql-codegen-binding'

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

        this.codegen()
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

  private codegen() {
    if (has(this.project.config, 'extensions.codegen')) {
      this.context.spinner.start(
        `Generating bindings for project ${this.projectDisplayName()}...`,
      )

      const {
        target,
        generator,
        language,
      } = this.project.config.extensions!.codegen
      // TODO reenable
      let generatorModule: any
      try {
        const modulePath = resolve.sync(generator, { basedir: process.cwd() })
        if (!modulePath) {
          throw new Error('Could not find module')
        }
        generatorModule = require(modulePath)
      } catch (e) {
        throw new Error(
          `Generator ${generator} could not be found. Please try yarn add --dev ${generator}`,
        )
      }

      let sdl
      if (this.project.config.schemaPath) {
        try {
          sdl = this.project.getSchemaSDL()
        } catch (e) {
          if (!has(this.project.config, 'extensions.endpoints')) {
            this.context.spinner.info(`Project ${
              this.projectName
            } has a schemaPath, but the schema doesn't exist.
Make sure to either provide a correct schemaPath or endpoint to fetch the schema from.`)
            return
          }
        }
      } else if (!has(this.project.config, 'extensions.endpoints')) {
        this.context.spinner.info(`Project ${
          this.projectName
        } has no schemaPath and no endpoint.
Make sure to either provide a correct schemaPath or endpoint to fetch the schema from.`)
        return
      }

      let endpoint = sdl
        ? undefined
        : get(this.project.config, 'extensions.endpoints')
      // endpoint can either be a string or an object with a url
      if (endpoint && Object.keys(endpoint).length > 0) {
        endpoint = endpoint[Object.keys(endpoint)[0]]
      }
      const headers =
        endpoint && endpoint.headers ? endpoint.headers : undefined
      if (endpoint && endpoint.url) {
        endpoint = endpoint.url
      }

      generatorModule.generateCode({
        schema: sdl,
        endpoint,
        target,
        generator: language,
        headers,
      })

      this.context.spinner.succeed(
        `Code for project ${this.projectDisplayName()} generated to ${chalk.green(
          target,
        )}`,
      )
    } else if (this.argv.verbose) {
      this.context.spinner.info(
        `Codegen not configured for project ${this.projectDisplayName()}. Skipping`,
      )
    }
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

    if (!projects) {
      throw new Error('No projects defined in config file')
    }

    return projects
  }

  private projectDisplayName = () => chalk.green(this.projectName)
}
