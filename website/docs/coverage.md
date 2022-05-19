---
id: coverage
title: coverage
sidebar_label: coverage
---

Schema coverage based on documents. Find out how many times types and fields are used in your application. See the [official GraphQL Inspector documentation](https://graphql-inspector.com/docs/essentials/coverage) for details.

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
  yarn global add @graphql-cli/coverage
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/coverage
  ```

  </TabItem>
</Tabs>

### Usage

```
graphql coverage [DOCUMENTS] [SCHEMA]
```

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `DOCUMENTS` | A glob pattern that points to GraphQL Documents / Operations | `documents` property in GraphQL Config file |
| `SCHEMA` | A pointer to a schema | `schema` property in GraphQL Config file |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--silent` | `-s` | Do not render any stats in the terminal | `false` |
| `--write` | `-w` | Write a file with coverage stats | disabled |
| `--deprecated` | `-d` | Fail on deprecated usage | `false` |
| `--require` | `-r` | Require a module | `[]` |
| `--token` | `-t` | An access token | `undefined` |
| `--header` | `-h` | Set HTTP header (`--header 'Auth: Basic 123'`) | `undefined` |
