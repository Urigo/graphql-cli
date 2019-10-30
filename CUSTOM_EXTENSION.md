## Writing your own GraphQL-CLI Extension

`graphql-cli` allow you to write your own plugin/extenion, and intergrate external tools and configuration, and run it from a single CLI.

The current implementationo of `graphql-cli` is using [Commander](https://github.com/tj/commander.js#common-option-types-boolean-and-value) to manage it's CLI commands, and it exposes a ready-to-use `Commander` instance that you can extend and add logic to it.

Plugins and extension are treated as NodeJS module by the `graphql-cli`, so it means you can use JavaScript/TypeScript/Any other super-set of JavaScript to write your extension. It means that you plugin will be loaded by it's name under `node_modules` - for example `graphql-cli my-custom-plugin ...`.

`graphql-cli` also support `graphql-config`, so it can help you easily load your GraphQL schema, operations and configuration from a unified config file.

> If you are wrapping an existing tool that has it's own CLI already, consider to expose a programtic API so it will be easier to consume.

### TL;DR

We have a ready-to-use boilerplate for that purpose, [you can find it here](https://github.com/dotansimha/graphql-cli-plugin-example).

Also, inside this repo, under `packages/commands` you can find a set of plugins implementation you can use as reference.

### Getting Started

Start by creating a simple JavaScript/TypeScript project, according to your preference, and have your `index` file exporting a variable called `plugin`, structed as object, with `init` method.

The `init` method will get trigged by the CLI host, and will pass the following to your method:

- `cwd` - The current directory.
- `program` - A `commander` instance you can use to register your CLI commands.
- `loadConfig` - A method you can use to load a GraphQL schema or documents, based on `graphql-config`.
- `reportError` - Helper method that allow you to report errors back to the GraphQL CLI, and effect the exit code of the CLI host. It's useful if you are dealing with async code in your extension.

It should be similar to this if you are using plain JavaScript:

```js
module.exports = {
  plugin: {
    init: ({ cwd, program, loadConfig, reportError }) => {
      // Your plugin code here, you can use "program" to register sub-commands.
    }
  }
};
```

Or, with TypeScript:

```ts
import { plugin } from '@test-graphql-cli/common';

export const plugin: CliPlugin = {
  init({ cwd, program, loadConfig, reportError }) {
    // Your plugin code here
  }
};
```

## Registering CLI sub-commands

To register your CLI commands, use the `program` instance:

```ts
program.command('my-plugin').action(async (cmd: string) => {
  // do something
});
```

Now, your plugin will be avaiable to use with the following command: `graphql my-plugin`.

You can also add custom validations, flags, default values and much more with Commander. [You can read the documentation here](https://github.com/tj/commander.js#common-option-types-boolean-and-value).

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

To easily load GraphQL schema, you can use `loadConfig` to get it from a `graphql-config` file:

```ts
import { plugin } from '@test-graphql-cli/common';

export const plugin: CliPlugin = {
  async init({ cwd, program, loadConfig, reportError }) {
    const config = await loadConfig();
    const schema = await config.getSchema();
  }
};
```

> You can also extend the `loadConfig` behavior by specifying custom loaders and extensions.

If you are using `graphql-config` to define your configuration, and you wish to load your extenion config from it, do:

```ts
type MyConfig = { ... };

const extensionConfig = await config.extension<MyConfig>('my-plugin');
```

## Error Handling

If you wish to fail the execution of your plugin and report it back to GraphQL CLI host, you should use `reportError`:

```ts
import { plugin } from '@test-graphql-cli/common';

export const plugin: CliPlugin = {
  async init({ cwd, program, loadConfig, reportError }) {
    try {
      // do something risky
      // or, throw:

      if (somethingIsMissing) {
        return reportError(new Error(`Ooops, something is missing`));
      }
    } catch (e) {
      reportError(e);
    }
  }
};
```
