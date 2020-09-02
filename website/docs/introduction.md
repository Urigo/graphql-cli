---
id: introduction
title: Introduction
sidebar_label: Introduction
---

![GraphQL CLI](https://user-images.githubusercontent.com/20847995/67651234-85bf1500-f916-11e9-90e5-cb3bd0e6a338.png)

### Features

* Helpful commands to improve your workflows
* Compatible with editors and IDEs based on [graphql-config](https://www.graphql-config.com)
* Powerful plugin system to extend graphql-cli with custom commands

### Installation

Run the following command to install GraphQL CLI globally:

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
  yarn global add graphql-cli graphql
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g graphql-cli graphql
  ```

  </TabItem>
</Tabs>

### Configuration 

GraphQL CLI utilizes GraphQL Config for its configuration. You can learn more about GraphQL Config [here](https://www.graphql-config.com). The easiest way to get started is to run `init` command from your desired workspace:

```
npx graphql-cli init
```

After a series of questions from the command-prompt, the command will use the inputs and selected project templates to generate your configuration file for you. You can also write your own configuration file using an editor of your choice. For example, you could create a `.graphqlrc.yml` file with the following content:

```
schema: "server/src/schema/**/*.graphql"
documents: "client/src/documents/**/*.graphql"
```

If you can run the `init` command with an existing file like the one above, its contents will be included with inputs you provide.

### Commands

Each command in GraphQL CLI is treated as a plugin. In order to use the command, you have to install it first. Each command's package name follows this pattern: `@graphql-cli/[COMMAND-NAME]`. So to install the `init` command we used above, we would run

<Tabs
  defaultValue="yarn"
  values={[
    {label: 'yarn', value: 'yarn'},
    {label: 'npm', value: 'npm'},
  ]}
>
  <TabItem value="yarn">

  ```
  yarn global add @graphql-cli/init
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/init
  ```

  </TabItem>
</Tabs>

After installing the command, we can then run it like this:

```
graphql init
```

Each command can be configured by updating the `extensions` field in your configuration file (`.graphqlrc.yml`). For example, if we install the `codegen` command, we can provide additional options to it like this:

```yml
schema: 
  ./server/src/schema/**/*.ts:
    require: ts-node/register
documents: ./client/src/graphql/**/*.ts
extensions:
  codegen:
    generates:
      ./server/src/generated-types.d.ts:
        plugins:
          - typescript
          - typescript-resolvers
      ./client/src/generated-types.tsx:
        plugins:
          - typescript
          - typescript-operations
          - typescript-react-apollo
```

You can learn more about each command by navigating to its page from the menu. You can also write your own commands; see [this guide](custom-commands) for a detailed explanation.

:::tip
Note: You can execute the command `graphql discover` to open a list of GraphQL CLI plugins you can still. This is the only command that is available without installing additional packages.
:::
