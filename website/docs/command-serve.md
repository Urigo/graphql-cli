---
id: serve
title: serve
sidebar_label: serve
---

Serves a GraphQL endpoint with mock data using [GraphQL Serve](https://graphback.dev/docs/graphqlserve/graphqlserve). 

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

```
graphql serve [PORT]
```

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `PORT` | Port on which to run the HTTP server | Random port |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--project` | `-p` | Name of a project in GraphQL Config | `undefined` |
