## Writing your own GraphQL-CLI Extension

`graphql-cli` allow you to write your own plugin/extenion, and intergrate external tools and configuration, and run it from a single CLI.

The current implementation of `graphql-cli` is using [Yargs](https://yargs.js.org/) to manage it's CLI commands.

Plugins and extension are treated as NodeJS module by the `graphql-cli`, so it means you can use JavaScript/TypeScript/Any other super-set of JavaScript to write your extension. It means that you plugin will be loaded by it's name under `node_modules` - for example `graphql-cli my-custom-plugin ...`.

`graphql-cli` also supports `graphql-config`, so it can help you easily load your GraphQL schema, operations and configuration from a unified config file.

> If you are wrapping an existing tool that has it's own CLI already, consider to expose a programatic API so it will be easier to consume.

### TL;DR

We have a ready-to-use boilerplate for that purpose, [you can find it here](https://github.com/dotansimha/graphql-cli-plugin-example).

Also, inside this repo, under `packages/commands` you can find a set of plugins implementation you can use as reference.

### Getting Started

Start by creating a simple JavaScript/TypeScript project, according to your preference. Install `@graphql-cli/common` package and use `defineCommand` utility in your entry point (usually `index` file):

```ts
import { defineCommand } from '@graphql-cli/common';

export default defineCommand((api) => {
  return {};
});
```

To register your CLI command, give it a name first. Use the `command` property:

```ts
export default defineCommand((api) => {
  return {
    command: 'my-plugin',
    async handler() {
      // code here
    },
  };
});
```

Now, your plugin will be avaiable to use with the following command: `graphql my-plugin`.

You can also add custom validations, flags, default values and much more with Yargs. [You can read the documentation here](https://yargs.js.org/docs/#api-commandcmd-desc-module).

## Testing your plugin locally

To test your plugin locally, install `graphql-cli` in your project as a `devDependency`, and run the following command:

```
graphql ./src/index.js
```

If you registerd sub-commands, you should be able to run those this way:

```
graphql ./src/index.js do-something
```

> The path should point to the entry point of your script, and if you are using TypeScript - point to the compile file.

## Loading GraphQL Schema

To easily load GraphQL schema, you can use `graphql-config`:

```ts
import { defineCommand } from '@graphql-cli/common';

export default defineCommand((api) => {
  return {
    command: 'my-plugin',
    builder(build) {
      return build.options({
        project: {
          type: 'string',
          describe: 'Name of your project',
        },
      });
    },
    async handler(args) {
      // use graphql-config and find configuration
      const config = await api.useConfig();
      // pick project
      const project = args.project ? config.getProject(args.project) : config.getDefault();
      // get schema
      const schema = await config.getSchema();
    },
  };
});
```

If you are using `graphql-config` to define your configuration, and you wish to load your extenion config from it, do:

```ts
type MyConfig = { ... };

const extensionConfig = await config.extension<MyConfig>('my-plugin');
```

## Error Handling

If you wish to fail the execution of your plugin and report it back to GraphQL CLI host, simply throw an error:

```ts
import { defineCommand } from '@graphql-cli/common';

export default defineCommand(() => {
  return {
    command: 'check-if-missing',
    handler() {
      if (somethingIsMissing) {
        throw new Error(`Ooops, something is missing`);
      }
    },
  };
});
```
