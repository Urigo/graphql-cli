# Migration from GraphQL CLI 3.x or older

Starting with GraphQL CLI 4.0 and higher, the way projects are set up is significantly restructured.

## Install the new version
To get started, install the new version:
```sh
yarn global add graphql-cli
```
You can also globally install using npm.

> NOTE: If you have previous version of the GraphQL-CLI installed make sure to uninstall it first

```bash
npm uninstall graphql-cli
```

## Update your configuration file
If you are working from an existing project, the GraphQL Config file that is used by GraphQL CLI is now called `.graphqlrc.yml` (by default) instead of `.graphqlconfig`. [Other options exist](https://graphql-config.com/usage) for naming the config files supported by GraphQL CLI, but this guide will assume you're using YAML syntax.

To migrate, you will first need to update your GraphQL Configuration file to match GraphQL Config's updated syntax and structure.

You can [check here](https://graphql-config.com/usage) for more information about the new structure.

###Specifying schema(s):

```yml
schema: ./src/schema/**/*.graphql #You can have URL endpoint, Git URL and local files using globs here.
```

`schemaPath` is replaced by `schema`, which is now more flexible then the previous approach. This field is used by all commands and plugins of GraphQL CLI.

## Comparison of old commands

### `get-schema` is no longer available
In previous versions, you were able to download the schema to the given path in `schemaPath` from the URL given inside `endpoint`. In the new version, `schema` refers to the endpoint of the schema.

If you use Prisma or any other tool that provides your schema under URL endpoint, you must specify it using the following syntax in your configuration YAML:

```yaml
schema: http://localhost:4000/graphql #This is the schema path
```

If you want to download the schema from this URL to your local file system, you will also need to install `codegen` plugin and its `schema-ast` plugin using the following command or its npm equivalent:

```bash
yarn add @graphql-cli/codegen @graphql-codegen/schema-ast --dev
```

After that, you can specify the output path of the local schema file:

```yaml
schema: http://localhost:4000/graphql
extensions:
  codegen:
    generates:
      ./schema.graphql:
        plugins:
          - schema-ast
```

By running `graphql codegen`, the `schema.graphql` file is generated in the root path of your project.

#### For JSON Output
If you want to download the schema as a `json` introspection file, you will need to install `@graphql-codegen/introspection` instead, and add `introspection` instead of `schema-ast`.

```yaml
schema: http://localhost:4000/graphql
extensions:
  codegen:
    generates:
      ./schema.json:
        plugins:
          - introspection
```

### `create` is no longer available: it is replaced by the `init` command.
If you want to create a GraphQL Config file on an existing project or create a project using a template from scratch, you can use `graphql init` command.
This command will ask some questions about your new or existing project to update your dependencies and create a new configuration file for GraphQL CLI.

### `diff` has been changed
If you want to see the differences between your schema and another schema, use the `diff` command as follows:
```yaml
graphql diff git:origin/master:schema.graphql
```
For example, `diff` will show the differences between the version in `schema` field of GraphQL Configuration file and the `schema.graphql` file in the remote master branch.

Alternatively, you can compare `schema` with a URL endpoint:
```yaml
graphql diff http://my-dev-instance.com/graphql
```

### `add-endpoint`, `add-project`, `schema-status`, `ping`, `query`, `prepare`, `lint` and `playground` commands are no longer available.
GraphQL CLI (as well as GraphQL Config) no longer separates `endpoints` and `schemaPath`. The new `schema` field refers to the single endpoint of your GraphQL schema, so it can be a URL endpoint or a local file. If your project uses a remote schema, you can directly define this URL in `schema` path without downloading it or defining it as an extra `endpoint` etc.

Instead of using these legacy commands, you can create a faked server to test your schema using the `yarn serve` command.

### `codegen` now uses GraphQL Code Generator
GraphQL CLI now uses GraphQL Code Generator which has a lot of plugins and templates for various environments, platforms and use cases. You can generate resolver signatures, TypeScript representations of your GraphQL Schema and more. [Check it out](https://graphql-code-generator.com/)

The usage is slightly different from the old one:
```yaml
schema: src/schema/**/*.graphql
extensions:
    codegen:
        src/generated-types.ts: # Output file name
            - typescript # Plugin names to be used
            - typescript-resolvers
```

For instance, consider a hypothetical case where you need to generate TypeScript resolvers signatures for your GraphQL project. To do this, you would install the `codegen` plugin and the additional plugins and templates for GraphQL Code Generator. For this case, you would need `typescript` and `typescript-resolvers` plugins:

```bash
yarn add @graphql-cli/codegen @graphql-codegen/typescript @graphql-codegen/typescript-resolvers --dev
```

Now, using a single command, you can run GraphQL Code Generator using GraphQL CLI:
```bash
graphql codegen
```

## Special Notes for Prisma users
Prisma users will need to download a schema from a URL endpoint. For example, here is a *legacy GraphQL Config file* doing this:

`.graphqlconfig`
```yaml
projects:
  app:
    schemaPath: src/schema.graphql
    extensions:
      endpoints:
        default: http://localhost:4000
  database:
    schemaPath: src/generated/prisma-client/prisma.graphql
    extensions:
      prisma: prisma/prisma.yml
```

**To update the configuration for the new GraphQL CLI** you need to rename the file to `.graphqlrc.yml`, and then update the file as follows:

`.graphqlrc.yml`
```yaml
projects:
  app:
    schema: src/schema.graphql
  database:
    schema: prisma/prisma.yml
    extensions:
      codegen:
        generates:
          ./src/generated/prisma-client/prisma.graphql:
            plugins:
              - schema-ast
```

You can directly point to your `prisma.yml` file instead of the URL endpoint.

Before running the GraphQL CLI command to use this new configuration, make sure you have installed the `@graphql-cli/codegen` and `@graphql-codegen/schema-ast` plugins using:
```sh
yarn add @graphql-cli/codegen @graphql-codegen/schema-ast --dev
```

Now you can run `graphql codegen --project database` for generating your `prisma.graphql` file.

You will also need to update your `prisma.yml` file if you're using `graphql get-schema` with Prisma:
```yaml
...
# Ensures Prisma client is re-generated after a datamodel change.
hooks:
  post-deploy:
    - graphql codegen --project database # instead of graphql get-schema
    - prisma generate
```
