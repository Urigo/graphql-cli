---
id: introspect
title: introspect
sidebar_label: introspect
---

Dumps an introspection file based on a schema. See the [official GraphQL Inspector documentation](https://graphql-inspector.com/docs/essentials/introspect) for details.

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
  yarn global add @graphql-cli/introspect
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/introspect
  ```

  </TabItem>
</Tabs>

### Usage

```
graphql introspect [SCHEMA]
```

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `SCHEMA` | A pointer to a schema | `schema` property in GraphQL Config file |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--write` | `-w` | Overwrite the output | `graphql.schema.json` |
| `--require` | `-r` | Require a module | `[]` |
| `--token` | `-t` | An access token | `undefined` |
| `--header` | `-h` | Set HTTP header (`--header 'Auth: Basic 123'`) | `undefined` |
