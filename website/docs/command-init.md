---
id: init
title: init
sidebar_label: init
---

Create a GraphQL project using a template or GraphQL Config file for your existing project.

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
  yarn global add @graphql-cli/init
  ```

  </TabItem>

  <TabItem value="npm">

  ```
  npm i -g @graphql-cli/init
  ```

  </TabItem>
</Tabs>

Note: Because you probably won't need to run this command again after bootstrapping your project, you can also run it using `npx` instead of installing the package: `npx graphql init`.

### Usage

```
graphql init
```

Follow the prompts to set up your project.

#### Arguments

*None*

#### Options

| option | alias | description | default |
| --- | --- | --- | --- |
| `--projectName` |   | Name of a project in GraphQL Config | `undefined` |
| `--templateName` |   | Name of one of the predefined templates | `undefined` |
| `--templateUrl` |   | GitHub URL of the template. For example http://github.com/example/graphql-cli-example-template | `undefined` |