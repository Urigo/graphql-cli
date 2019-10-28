# GraphQL CLI

![image](https://user-images.githubusercontent.com/20847995/67651234-85bf1500-f916-11e9-90e5-cb3bd0e6a338.png)

[![npm version](https://badge.fury.io/js/%40test-graphql-cli%2Fcli.svg)](https://badge.fury.io/js/%40test-graphql-cli%2Fcli)
[![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH)

📟 Command line tool for common GraphQL development workflows

## Features

- Helpful commands to improve your workflows
- Compatible with editors and IDEs based on [`graphql-config`](https://github.com/kamilkisiela/graphql-config)
- Powerful plugin system to extend `graphql-cli` with custom commands


## Install

You can simply install the CLI using `npm` or `yarn` by running the following command. This will add the `graphql` binary to your path.

```sh
npm install -g graphql-cli
```

## Usage


## Plugins

- [`graphql-cli-voyager`](https://github.com/graphql-cli/graphql-cli-voyager) - Open [graphql-voyager](https://github.com/APIs-guru/graphql-voyager) in your browser
- `graphql-cli-faker` (*coming soon*) - Run a fake server based on your schema using [graphql-faker](https://github.com/APIs-guru/graphql-faker)
- [`graphql-cli-load`](https://github.com/neo4j-graphql/graphql-cli-load) - Easy batched loading of JSON/CSV files using your mutations, by matching input fields to mutation parameters from the schema.
- [`graphql-cli-up`](https://github.com/supergraphql/graphql-cli-up) - Run `graphql-up` as `graphql up`.
- [`graphql-cli-generate-fragments`](https://github.com/develomark/graphql-cli-generate-fragments) - Generates GraphQL fragments for each type in the project schema.

Do you want to create your own plugin? [Here is a simple example.](plugin-example)

## Help & Community [![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH9)

Join our [Discord chat](https://discord.gg/xud7bH9) if you run into issues or have questions. We love talking to you!
