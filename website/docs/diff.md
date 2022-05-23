---
id: diff
title: diff
sidebar_label: diff
---

Detect changes to your GraphQL Schema and prevent breaking your existing applications. See the [official GraphQL Inspector documentation](https://graphql-inspector.com/docs/essentials/diff) for details.

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
  yarn global add @graphql-cli/diff
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/diff
  ```

  </TabItem>
</Tabs>

### Usage

```
graphql diff [OLD_SCHEMA] [NEW_SCHEMA]
```

#### Arguments

| argument | description | default |
| --- | --- | --- |
| `OLD_SCHEMA` | A pointer to the old schema | `extensions.diff.baseSchema` property in GraphQL Config file |
| `NEW_SCHEMA` | A pointer to the new schema | `schema` property in GraphQL Config file |

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--require` | `-r` | Require a module | `[]` |
| `--token` | `-t` | An access token | `undefined` |
| `--header` | `-h` | Set HTTP header (`--header 'Auth: Basic 123'`) | `undefined` |
