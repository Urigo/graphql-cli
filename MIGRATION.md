# Migration from GraphQL 3.x or older

We now have a different structure for GraphQL CLI after 4.xx.

## Install the new version
First install the new version like below;
```bash
yarn global add graphql-cli@4.0.0-alpha.10
```

## Update your configuration file
You need to have a configuration file under `.graphqlrc.yml` instead of `.graphqlconfig`. But other file types are also supported. This guide will assume you're using YAML syntax.

First you need to update your GraphQL Configuration file because GraphQL Config currently has a different structure.
You can [check here](https://graphql-config.com/docs/usage) for more information about the new structure.

```yml
schema: ./src/schema/**/*.graphql #You can have URL endpoint, Git URL and local files using globs here.
```

`schemaPath` is replaced by `schema` which is now more flexible then the old one. This field is used by all commands and plugins of GraphQL CLI.

## Comparison of old commands

### `get-schema` is no longer available
You were able to download the schema to the given path in `schemaPath` from the URL given inside `endpoint`. But now `schema` means your endpoint of the schema. If you use Prisma or any other tool that provides your schema under URL endpoint. You need to specify it like below;

```yaml
schema: http://localhost:4000/graphql #This is the schema path
```

So, if you want to download the schema from this URL to your local file system. You need to install `codegen` plugin and its `schema-ast` plugin like below;

```bash
yarn add @test-graphql-cli/codegen @graphql-codegen/schema-ast --dev
```

After that, you can specify the output path of the local schema file;

```yaml
schema: http://localhost:4000/graphql
codegen:
    ./schema.graphql:
        - schema-ast
```

By running `graphql codegen`, you will have `schema.graphql` file in the root path of your project.

### `create` is no longer available, it is replaced by `init` command.
If you want to create a GraphQL Config file on an existing project or create a project using a template from scratch, you can use `graphql init` command.
This command will ask some questions about your new or existing project to update your dependencies and create a new configuration file for GraphQL CLI.

### `diff` has been changed
If you want to see the differences between your schema and another schema, you need to use `diff` command like below;
```yaml
graphql diff git:origin/master:schema.graphql
```
For example that command will show the differences between the version in `schema` field of GraphQL Configuration file and the `schema.graphql` file in the remote master branch.
Or you can compare it with a URL endpoint;
```yaml
graphql diff http://my-dev-instance.com/graphql
```

### `add-endpoint`, `add-project`, `schema-status`, `ping`, `query`, `prepare`, `lint` and `playground` commands are no longer available.
GraphQL CLI and Config doesn't seperate `endpoints` and `schemaPath` like before. New `schema` field means your single endpoint of your GraphQL schema. So it can be a URL endpoint or a local file. If your project uses a remote schema, you can directly define this URL in `schema` path without downloading it or defining it as an extra `endpoint` etc.
Instead of these, you can have a faked server to test your schema you can use `yarn serve` command.
