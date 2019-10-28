# GraphQL CLI

![image](https://user-images.githubusercontent.com/20847995/67651234-85bf1500-f916-11e9-90e5-cb3bd0e6a338.png)

[![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH)

Currently we have `next` version. Help us to improve new GraphQL CLI. Checkout new structure and commands below!
Feel free to contact us in Discord channel. We would love to hear your feedback.

## Features

- Helpful commands to improve your workflows
- Compatible with editors and IDEs based on [`graphql-config`](https://github.com/kamilkisiela/graphql-config)
- Powerful plugin system to extend `graphql-cli` with custom commands


## Install

You can simply install the CLI using `npm` or `yarn` by running the following command. This will add the `graphql` binary to your path.

```sh
yarn global add graphql-cli@next
```

## Usage / Initialization

You can create a GraphQL Config file by yourself. [Learn more about GraphQL Config](https://graphql-config.com/docs/introduction)
```yaml
schema: src/schema/**/*.graphql
documents: src/documents/**/*.graphql
```

Or you can create a GraphQL Config file for GraphQL CLI for your project or create a GraphQL project from scratch even with using a OpenAPI/Swagger file. After installing the CLI like above, you can run the following command;

```sh
graphql init
```

So, it will ask some questions about your project. Then it will create a GraphQL Config file and install necessary plugins etc.

## Plugin system

Each command in GraphQL CLI is a seperate package, so you can have your own plugins or use the ones we maintain. You can have those commands by installing them like `@test-graphql-cli/[COMMAND-NAME]@next`.

To configure a command/plugin, you need to use `extensions` field in your config file. [Check out the example](https://github.com/ardatan/graphql-cli-template/blob/924c6dc880a06abe468c10bea369e249dcb2aa4c/.graphqlrc.yml#L5)

- [`init`](https://github.com/Urigo/graphql-cli/tree/focs/packages/commands/init) - Creates a GraphQL project using a template or GraphQL Config file for your existing project.
- [`codegen`](https://github.com/Urigo/graphql-cli/tree/focs/packages/commands/codegen) - GraphQL Code Generator's GraphQL CLI plugin. GraphQL Code Generator is a tool that generates code from your GraphQL schema and documents for your backend or frontend with flexible support for custom plugins and templates. [Learn More](https://graphql-code-generator.com)
- [`generate`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/generate) - Generate DB, schema, document and resolvers for your GraphQL project by using [GraphBack](https://graphback.dev)
- [`coverage`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/coverage) - Schema coverage based on documents. Find out how many times types and fields are used in your application using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/coverage)
- [`diff`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/diff) - Compares schemas and finds breaking or dangerous changes using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/diff)
    - You can also compare your current schema against a base schema using URL, Git link and local file. You can give this pointer in the command line after `graphql diff` or in GraphQL Config file 
```yml
...
extensions:
...
  diff:
    baseSchema: git:origin/master:schema.graphql
...
...
```
- [`similar`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/similar) - Get a list of similar types in order to find duplicates using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/similar).
- [`validate`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/validate) - Validates documents against a schema and looks for deprecated usage using [GraphQL Inspector](https://graphql-inspector.com/docs/essentials/validate).
- [`serve`](https://github.com/Urigo/graphql-cli/tree/master/packages/commands/serve) - Serves a faked GraphQL server, you can define your own mocks for each types and scalars inside GraphQL Config like below;
```yml
...
extensions:
...
  serve:
    mocks:
      DateTime: graphql-scalars#DateTimeMock #Imports DateTimeMock function from graphql-scalars for mocking DateTimeMock
...
...
```

You can create a plugin, please check the existing ones to see how to use GraphQL Config and CLI API.

## Help & Community [![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH9)

Join our [Discord chat](https://discord.gg/xud7bH9) if you run into issues or have questions. We love talking to you!

