---
id: similar
title: similar
sidebar_label: similar
---

Get a list of similar types in order to find duplicates. See the [official GraphQL Inspector documentation](https://graphql-inspector.com/docs/essentials/similar) for details.

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
  yarn global add @graphql-cli/similar
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/similar
  ```

  </TabItem>
</Tabs>

### Usage

```
graphql similar [SCHEMA]
```

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `SCHEMA` | A pointer to a schema | `schema` property in GraphQL Config file |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--type` | `-n` | Check only a single type | all types |
| `--threshold` | `-t` | Threshold of similarity ratio | `0.4` |
| `--write` | `-w` | Write a file with results | disabled |
| `--require` | `-r` | Require a module | `[]` |
| `--token` | `-t` | An access token | `undefined` |
| `--header` | `-h` | Set HTTP header (`--header 'Auth: Basic 123'`) | `undefined` |
