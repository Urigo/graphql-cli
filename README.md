# graphql-cli

[![npm version](https://badge.fury.io/js/graphql-cli.svg)](https://badge.fury.io/js/graphql-cli) [![Build Status](https://travis-ci.org/graphql-cli/graphql-cli.svg?branch=master)](https://travis-ci.org/graphql-cli/graphql-cli)

📟 Command line tool for common GraphQL development workflows

## Features

- Helpful commands to improve your workflows like `get-schema`, `diff` & `playground`
- Compatible with editors and IDEs based on [`graphql-config`](https://github.com/graphcool/graphql-config)
- Powerful plugin system to extend `graphql-cli` with custom commands

You can see it in action here:

![demo](http://imgur.com/0kuqZFY.gif)

> Note: The `graphql-cli` has a different use case than the [Graphcool CLI](https://docs-next.graph.cool/reference/graphcool-cli/overview-zboghez5go). Read more about the differences [here](https://docs-next.graph.cool/faq/other-reob2ohph7/#whats-the-difference-between-the-graphcool-cli-and-the-graphql-cli).

## Install

You can simply install the CLI using `npm` or `yarn` by running the following command. This will add the `graphql` (and shorter `gql`) binary to your path.

```sh
npm install -g graphql-cli
```


## Usage
```
Usage: graphql [command]

Commands:
  init           Initial config setup
  add-endpoint   Add new endpoint to .graphqlconfig
  get-schema     Download schema from endpoint
  schema-status  Show source and timestamp of the local schema file
  ping           Ping GraphQL endpoint
  query <file>   Run query/mutation
  diff           Show a diff between two schemas
  playground     Open interactive GraphQL Playground
  lint           Check schema for linting errors

Options:
  -p, --project  Project name                                           [string]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]

Examples:
  graphql init                 Interactively setup .graphqlconfig file
  graphql get-schema -e dev    Update local schema to match "dev" endpoint
  graphql diff -e dev -t prod  Show schema diff between "dev" and "prod" endpoints

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
- [`graphql-cli-bundle`](https://github.com/supergraphql/graphql-cli-bundle) - Bundle schemas with imports into a single schema file using [`graphql-import`](https://github.com/graphcool/graphql-import)
- [`graphql-cli-binding`](https://github.com/supergraphql/graphql-cli-binding) - Generate static binding files for query delegation using [`graphql-static-binding`](https://github.com/supergraphql/graphql-static-binding)

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
