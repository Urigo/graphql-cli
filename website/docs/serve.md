---
id: serve
title: serve
sidebar_label: serve
---

Serves a full featured [GraphQL CRUD](https://graphqlcrud.org/) API with subscriptions and data synchronization running in just a few seconds without writing a single line of code - all you need is a data model `.graphql` file.

GraphQL Serve is a CLI tool that leverages the power of Graphback to generate a codeless Node.js GraphQL API complete with schema and CRUD resolvers and an in-memory MongoDB database.  

### Installation

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs
  defaultValue="yarn"
  values={[
    {label: 'yarn', value: 'yarn'},
    {label: 'npm', value: 'npm'},
  ]}
>
  <TabItem value="yarn">

  ```
  yarn global add @graphql-cli/serve
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/serve
  ```

  </TabItem>
</Tabs>

### Usage

The bare minimum you need is a GraphQL file with your data models. Create a file called `Note.graphql` and add the following:

```graphql
""" @model """
type Note {
  _id: GraphbackObjectID!
  title: String!
  description: String
  likes: Int
}

scalar GraphbackObjectID
```

The `@model` annotation indicates that `Note` is a data model and Graphback will generate resolvers, a CRUD service and data source for it. You can learn how to build more complex data models in [Data Model](https://graphback.dev/docs/model/datamodel#model).

#### Running your codeless GraphQL server

To start your server, run the following command from the same directory as `Note.graphql`:

```bash
graphql serve Note.graphql
```

This will start a GraphQL server on a random port using the `Note.graphql` data models we just added.

You can customise the directory of the data models:

```bash
graphql serve ./path/to/models
```

You can also specify where to load the data models from with a Glob pattern:

```bash
graphql serve ./schema/**/*.graphql
```

You can specify which port to start the server on:

```bash
$ graphql serve ./path/to/models --port 8080

Starting server...

Listening at: http://localhost:8080/graphql
```

### Enable Data Synchronization

GraphQL Serve can also operate on data sync models. Under the hood this uses the [Data Sync](https://graphback.dev/docs/datasync/intro) package. 
To enable data synchronization, all we need to do is enable datasync capabilities on our models via the `@datasync` annotation.

For the `Note` model defined above, this would look like: 

```graphql
""" 
@model
@datasync 
"""
type Note {
  _id: GraphbackObjectID!
  title: String!
  description: String
  likes: Int
}

scalar GraphbackObjectID
```

Once we have a model with datasync capabilities, we can run our GraphQL server by enabling data synchronization as shown below:

```bash
graphql serve Note.graphql --datasync
```

Conflict resolution strategies for datasync enabled models can be specified via the --conflict option:

```bash
graphql serve Note.graphql --datasync --conflict=clientSideWins
```

This defaults to ClientSideWins, if unset.

The TTL for delta tables, can also be set using the --deltaTTL option:

```bash
graphql serve Note.graphql --datasync --deltaTTL=172800
```

This value defaults to `172800` when unused
 

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `Model` | Directory to search for data models | `undefined` |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--port` | `-p` | Port on which to run the HTTP server | `Random port` |
| `--datasync` | `--ds` | Enable datasynchronization features | `false` |
| `--deltaTTL` | N/A | Specify a conflict resolution strategy with --datasync. Choices: `clientSideWins`, `serverSideWins`, `throwOnConflict` | `clientSideWins` |
| `--conflict` | N/A | Specify a TTL for delta tables with --datasync | `172800` |


