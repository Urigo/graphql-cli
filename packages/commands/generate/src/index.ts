import { defineCommand } from '@graphql-cli/common';
import { generateUsingPlugins, createDBResources } from 'graphback-cli';

interface CliFlags {
  db: boolean;
  backend: boolean;
  silent: boolean;
  watch: boolean;
}

export default defineCommand<{}, CliFlags>(() => {
  return {
    command: 'generate',
    builder(builder) {
      return builder.options({
        db: {
          type: 'boolean',
        },
        backend: {
          type: 'boolean',
        },
        silent: {
          type: 'boolean',
        },
        watch: {
          alias: 'w',
          type: 'boolean',
          describe: 'Watch for changes and execute generation automatically',
        },
      });
    },
    async handler(args) {
      if (args.backend) {
        await generateUsingPlugins(args);
      } else if (args.db) {
        await createDBResources({});
      } else {
        await generateUsingPlugins(args);
      }
    },
  };
});
