---
id: generate
title: generate
sidebar_label: generate
---

Generate schema and client documents for your GraphQL project by using [Graphback](https://graphback.dev).

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
  yarn global add @graphql-cli/generate
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/generate
  ```

  </TabItem>
</Tabs>

### Example Configuration

```yml
schema: './src/schema.graphql'
documents: './client/src/graphql/**/*.graphql'
extensions:
  graphback:
    model: './model/*.graphql'
    plugins:
      graphback-schema:
        outputPath: './src/schema/schema.graphql'
      graphback-client:
        outputFile: './client/src/graphql/graphback.graphql'
```

See [the docs](https://graphback.dev/docs/introduction) for more details.

### Usage

```
graphql generate
```

#### Arguments

*None*

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--watch` | `-w` | Watch for changes and execute generation automatically |   |
| `--db` |   |   |   |
| `--backend` |   |   |   |
| `--silent` |   |   |   |
