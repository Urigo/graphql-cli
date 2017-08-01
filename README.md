# graphql-cli

🔪🥒 Swiss Army Knife for your GraphQL Project

![demo](docs/demo.gif){:height="700px" width="400px"}

## Features

- configurable through [GraphQL Config](https://github.com/graphcool/graphql-config)
- interactively setup your `.graphqlconfig`
- bunch of commands to automate your everyday tasks: `diff`, `ping`, `get-schema`, `playground`, and more coming
- plugin supports: create your own commands ([plugin example](./plugin-example))

## Installation
Use `npm`

    npm install -g graphql-cli

or `yarn`

    yarn global add graphql-cli

## Usage
```
Usage: graphql [command]

Commands:
  init                       Interactively set up GraphQL config
  add-endpoint               add new endpoint to .graphqlconfig
  get-schema [endpointName]  Download GraphQL schema
  schema-status              Show source and timestamp of the local schema file
  ping [endpointName]        Ping GraphQL endpoint
  diff <from> [to]           Show a diff between GraphQL schemas of two
                             endpoints
  playground [endpointName]  Open ready-to-use GraphQL Playground in your browser
  completion                 generate bash completion script

Options:
  --help  Show help                                                    [boolean]

Examples:
  graphql init            interactively init .graphqlconfig file
  graphql get-schema dev  download schema from "dev" endpoint and save to
                             local file
  graphql ping dev        send simple GraphQL query to "dev" endpoint
  graphql diff dev prod   show schema diff between "dev" and "prod" endpoints
  graphql diff dev        show schema diff between "dev" and local saved
                             schema

for more information, check out https://github.com/graphcool/graphcool-cli
```

### Autocompletion
To install autocompletion in your terminal run

    graphql completion >> ~/.bashrc

or on OSX

    graphql completion >> ~/.bash_profile

## Plugins

- [`graphql-cli-voyager`](https://github.com/graphcool/graphql-cli-voyager) - open [graphql-voyager](https://github.com/APIs-guru/graphql-voyager) in your browser
- `graphql-cli-faker` (__coming soon__) - run fake server based on your server schema via [graphql-faker](https://github.com/APIs-guru/graphql-faker)



## Help & Community [![Slack Status](https://slack.graph.cool/badge.svg)](https://slack.graph.cool)

Join our [Slack community](http://slack.graph.cool/) if you run into issues or have questions. We love talking to you!

![](http://i.imgur.com/5RHR6Ku.png)
