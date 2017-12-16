# Plugin Example

Writing plugins for `graphql-cli` is simple. You can find a simple example in the files above.

Other people can use your plugin by simply globally installing it via NPM like in the snippet below. `graphql-cli` will automatically add the exposed commands to the list of commands, just make sure the name of the plugin you're publishing on NPM starts with `graphql-cli-`.

```sh
npm install -g graphql-cli-plugin-example
```
