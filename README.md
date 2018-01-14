# graphql-cli

[![npm version](https://badge.fury.io/js/graphql-cli.svg)](https://badge.fury.io/js/graphql-cli) [![CircleCI](https://circleci.com/gh/graphql-cli/graphql-cli.svg?style=shield)](https://circleci.com/gh/graphql-cli/graphql-cli)

📟 Command line tool for common GraphQL development workflows

## Features

- Helpful commands to improve your workflows like `get-schema`, `diff` & `playground`
- Compatible with editors and IDEs based on [`graphql-config`](https://github.com/graphcool/graphql-config)
- Powerful plugin system to extend `graphql-cli` with custom commands

You can see it in action here:

![demo](http://imgur.com/0kuqZFY.gif)

> Note: The `graphql-cli` has a different use case than the [Graphcool CLI](https://www.graph.cool/docs/reference/graphcool-cli/overview-zboghez5go/). Graphcool CLI is specific to the Graphcool Framework, while `graphql-cli` can be used with any GraphQL project.

## Install

You can simply install the CLI using `npm` or `yarn` by running the following command. This will add the `graphql` (and shorter `gql`) binary to your path.

```sh
npm install -g graphql-cli
```


## Usage
```
Usage: graphql [command]

Commands:
  graphql create [directory]             Bootstrap a new GraphQL project
  graphql add-endpoint                   Add new endpoint to .graphqlconfig
  graphql add-project                    Add new project to .graphqlconfig
  graphql get-schema                     Download schema from endpoint
  graphql schema-status                  Show source & timestamp of local schema
  graphql ping                           Ping GraphQL endpoint
  graphql query <file>                   Run query/mutation
  graphql diff                           Show a diff between two schemas
  graphql playground                     Open interactive GraphQL Playground
  graphql lint                           Check schema for linting errors
  graphql prepare                        Bundle schemas and generate bindings
  graphql codegen [--target] [--output]  Generates apollo-codegen
                                         code/annotations from your
                                         .graphqlconfig

Options:
  --dotenv       Path to .env file                                      [string]
  -p, --project  Project name                                           [string]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  graphql init                 Interactively setup .graphqlconfig file
  graphql get-schema -e dev    Update local schema to match "dev" endpoint
  graphql diff -e dev -t prod  Show schema diff between "dev" and "prod"
                               endpoints

For more information go to https://github.com/graphql-cli/graphql-cli

```

### Initial setup and schema download

### Listen to schema changes

### Autocompletion setup
To install autocompletion in your terminal run

```
graphql completion >> ~/.bashrc
```

or on OSX

```sh
graphql completion >> ~/.bash_profile
```

## Plugins

- [`graphql-cli-voyager`](https://github.com/graphql-cli/graphql-cli-voyager) - Open [graphql-voyager](https://github.com/APIs-guru/graphql-voyager) in your browser
- `graphql-cli-faker` (*coming soon*) - Run a fake server based on your schema using [graphql-faker](https://github.com/APIs-guru/graphql-faker)
- [`graphql-cli-codegen`](https://github.com/rricard/graphql-cli-codegen) - Generates type annotation from your GraphQL queries using [`apollo-codegen`](https://github.com/apollographql/apollo-codegen).
- [`graphql-cli-load`](https://github.com/neo4j-graphql/graphql-cli-load) - Easy batched loading of JSON/CSV files using your mutations, by matching input fields to mutation parameters from the schema.
- [`graphql-cli-up`](https://github.com/supergraphql/graphql-cli-up) - Run `graphql-up` as `graphql up`.

Do you want to create your own plugin? [Here is a simple example.](plugin-example)


## Contributors

A big thank you to all contributors and supporters of this repository 💚

<a href="https://github.com/IvanGoncharov/" target="_blank">
  <img src="https://github.com/IvanGoncharov.png?size=64" width="64" height="64" alt="IvanGoncharov">
</a>
<a href="https://github.com/RomanGotsiy/" target="_blank">
  <img src="https://github.com/RomanGotsiy.png?size=64" width="64" height="64" alt="RomanGotsiy">
</a>
<a href="https://github.com/schickling/" target="_blank">
  <img src="https://github.com/schickling.png?size=64" width="64" height="64" alt="schickling">
</a>
<a href="https://github.com/kbrandwijk/" target="_blank">
  <img src="https://github.com/kbrandwijk.png?size=64" width="64" height="64" alt="kbrandwijk">
</a>

## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

![](http://i.imgur.com/5RHR6Ku.png)
