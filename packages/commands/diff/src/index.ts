import { defineCommand } from '@graphql-cli/common';
import { loaders } from '@graphql-cli/loaders';
import diff from '@graphql-inspector/diff-command';
import { LoadersRegistry } from '@graphql-inspector/loaders';

export default defineCommand(() => {
  const loadersRegistry = new LoadersRegistry();

  loaders.forEach((loader) => loadersRegistry.register(loader));

  return diff({
    config: {
      loaders: [],
      commands: [],
    },
    loaders: loadersRegistry,
    async interceptArguments() {},
    interceptOptions(opts) {
      return opts;
    },
    interceptPositional(_key, opt) {
      return opt;
    },
  });
});
