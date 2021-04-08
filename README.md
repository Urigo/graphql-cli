# GraphQL CLI

![image](https://user-images.githubusercontent.com/20847995/67651234-85bf1500-f916-11e9-90e5-cb3bd0e6a338.png)

![CI](https://github.com/Urigo/graphql-cli/workflows/CI/badge.svg)
[![npm version](http://img.shields.io/npm/v/graphql-cli.svg?style=flat)](https://npmjs.org/package/graphql-cli "View this project on npm") [![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://the-guild.dev/discord)

Help us to improve new GraphQL CLI. Check out the new structure and commands below!
Feel free to contact us in Discord channel. We would love to hear your feedback.

## Features

- Helpful commands to improve your workflows
- Compatible with editors and IDEs based on [`graphql-config`](https://github.com/kamilkisiela/graphql-config)
- Powerful plugin system to extend `graphql-cli` with custom commands

## Install

You can install the CLI using `yarn` by running the following command. This will add the `graphql` binary to your path.

```sh
yarn global add graphql-cli
```

The equivalent npm global install will also work.

## Migration from 3.x.x to 4.x.x

**Important: many aspects of GraphQL CLI syntax and structure have changed in 4.x.x.** Please check out the [Migration Guide](./docs/MIGRATION.md) to learn more.

## Usage / Initialization

At the heart of a project created using GraphQL CLI is the GraphQL Config configuration file. For starters, this configuration lets the cd CLI tools know where all of the GraphQL documents and operations are. For more information about GraphQL Config, [you can click here to learn more](https://graphql-config.com/docs/introduction).

The most straightforward way to launch a GraphQL CLI-capable project with a working GraphQL Config setup is to use the `init` command from your desired workspace:

```sh
npx graphql-cli init
```

After a series of questions from the command-prompt, the system will use the inputs and selected project templates to generate a working project complete with a GraphQL Config setup. The GraphQL Config file is generated referencing the necessary files and ecosystem plugins.

You can also get started with GraphQL CLI by creating your own GraphQL Config file using an editor of your choice. Starting with a filename `.graphqlrc.yml`, for instance, we could add:

```yml
schema: "server/src/schema/**/*.graphql"
documents: "client/src/documents/**/*.graphql"
```

This is now a valid YAML-syntax GraphQL Config file. Using `init` from the GraphQL CLI will generate a project based on the instructions in your YAML.

Finally, one of the options with `graphql init` is to access schema using an OpenAPI or Swagger endpoint. Choose this option at the start of the Init question tree, and then follow the instructions to navigate to the URL of your choice.

## Plugin System

Each command in GraphQL CLI is a seperate package, so you can have your own plugins or use the ones we maintain. You can have those commands by installing them like `@graphql-cli/[COMMAND-NAME]`.

To configure a command/plugin, you need to update the `extensions` field in your GraphQL Config file (`.graphqlrc.yml`). See `extensions:` in the example below.

```yml
schema: 
  ./server/src/schema/**/*.ts:
    require: ts-node/register
documents: ./client/src/graphql/**/*.ts
extensions:
  codegen:
    generates:
      ./server/src/generated-types.d.ts:
        plugins:
          - typescript
          - typescript-resolvers
      ./client/src/generated-types.tsx:
        plugins:
          - typescript
          - typescript-operations
          - typescript-react-apollo
      config:
        withHooks: true
  graphback:
    model: './model/*.graphql'
    plugins:
      graphback-schema:
        outputPath: './src/schema/schema.graphql'
      ...
```
  
 [For a detailed example check out a template file here.](https://github.com/Urigo/graphql-cli/blob/master/templates/fullstack/.graphqlrc.yml)

Some of the available Plugins are:

- [`init`](https://github.com/Urigo/graphql-cli/tree/focs/packages/commands/init) - Creates a GraphQL project using a template or GraphQL Config file for your existing project.
- [`codegen`](https://github.com/dotansimha/graphql-code-generator/tree/master/packages/graphql-cli-codegen-plugin) - GraphQL Code Generator's GraphQL CLI plugin. GraphQL Code Generator is a tool that generates code from your GraphQL schema and documents for your backend or frontend with flexible support for custom plugins and templates. [Learn More](https://graphql-code-generator.com)
- [`generate`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/generate) - Generate schema and client-side documents for your GraphQL project by using [Graphback](https://graphback.dev).
- [`coverage`](https://github.com/kamilkisiela/graphql-inspector/tree/master/packages/graphql-cli/coverage) - Schema coverage based on documents. Find out how many times types and fields are used in your application using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/coverage).
- [`diff`](https://github.com/kamilkisiela/graphql-inspector/tree/master/packages/graphql-cli/diff) - Compares schemas and finds breaking or dangerous changes using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/diff).
    - You can also compare your current schema against a base schema using URL, Git link and local file. You can give this pointer in the command line after `graphql diff` or in GraphQL Config file:

```yml
# ...
extensions:
  diff:
    baseSchema: git:origin/master:schema.graphql
```

- [`similar`]((https://github.com/kamilkisiela/graphql-inspector/tree/master/packages/graphql-cli/similar)) - Get a list of similar types in order to find duplicates using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/similar).
- [`validate`]((https://github.com/kamilkisiela/graphql-inspector/tree/master/packages/graphql-cli/validate)) - Validates documents against a schema and looks for deprecated usage using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/validate).
- [`serve`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/serve) - Serves a GraphQL server, using an in memory database and a defined GraphQL schema. Please read through [serve documentation](./website/docs/command-serve.md) to learn more about this command.

More plugins are definitely welcome! Please check the existing ones to see how to use GraphQL Config and GraphQL CLI API.

## Contributing

Please read through the [contributing guidelines](./CONTRIBUTING.md)

## Writing your own plugin

GraphQL CLI supports custom plugins, [you can find a tutorial and example here](./docs/CUSTOM_EXTENSION.md)

## Help & Community [![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://the-guild.dev/discord)

Join our [Discord chat](https://the-guild.dev/discord) if you run into issues or have questions. We're excited to welcome you to the community!
