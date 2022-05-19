---
id: validate
title: validate
sidebar_label: validate
---

Validates documents against a schema and looks for deprecated usage.. See the [official GraphQL Inspector documentation](https://graphql-inspector.com/docs/essentials/validate) for details.

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
  yarn global add @graphql-cli/validate
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/validate
  ```

  </TabItem>
</Tabs>

### Usage

```
graphql validate [DOCUMENTS] [SCHEMA]
```

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `DOCUMENTS` | A glob pattern that points to GraphQL Documents / Operations | `documents` property in GraphQL Config file |
| `SCHEMA` | A pointer to a schema | `schema` property in GraphQL Config file |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--deprecated` | `-d` | Fail on deprecated usage | `false` |
| `--noStrictFragments` |   | Do not fail on duplicated fragment names | `false` |
| `--apollo` |   | Support Apollo directives (@client and @connection) | `false` |
| `--keepClientFields` |   | Keeps the fields with @client, but removes @client directive from them - works only with combination of `--apollo` | `false` |
| `--maxDepth` |   | Fail when operation depth exceeds maximum depth  | `undefined` |
| `--require` | `-r` | Require a module | `[]` |
| `--token` | `-t` | An access token | `undefined` |
| `--header` | `-h` | Set HTTP header (`--header 'Auth: Basic 123'`) | `undefined` |
