---
id: codegen
title: codegen
sidebar_label: codegen
---

Generate code from your GraphQL schema and operations. See the official [GraphQL Code Generator](https://graphql-code-generator.com/) site for complete documentation, guides and more.

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
  yarn global add @graphql-cli/codegen
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/codegen
  ```

  </TabItem>
</Tabs>

Note: GraphQL Code Generator also utilizes a plugin system, so make sure you also install any plugins you include inside your configuration. See [here](https://graphql-code-generator.com/docs/plugins/index) for a list of plugins.

### Example Configuration

```yml
schema:
  - http://localhost:4000/graphql
extensions:
  codegen:
    generates:
      ./graphql.schema.json:
        plugins:
          - "introspection"
```

See [the docs](https://graphql-code-generator.com/docs/getting-started/codegen-config) for more details.

### Usage

```
graphql codegen
```

#### Arguments

*None*

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--config` | `-c` | Path to GraphQL codegen YAML config file | `codegen.yml` or GraphQL configuration file in cwd |
| `--watch` | `-w` | Watch for changes and execute generation automatically. You can also specify a glob expreession for custom watch list. |   |
| `--require` | `-r` | Loads specific require.extensions before running the codegen and reading the configuration | `[]` |
| `--overwrite` | `-o` | Overwrites existing files | `true` |
| `--silent` | `-s` | Suppresses printing errors | `false` |
| `--project` | `-p` | Name of a project in GraphQL Config | `undefined` |