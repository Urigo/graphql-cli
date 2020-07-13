import { defineCommand } from '@graphql-cli/common';
import { generateUsingPlugins } from 'graphback-cli';

interface CliFlags {
  backend: boolean;
  silent: boolean;
  watch: boolean;
}

export default defineCommand<{}, CliFlags>(() => {
  return {
    command: 'generate',
    builder(builder: any) {
      return builder.options({
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
    async handler(args: any) {
      return generateUsingPlugins(args);
    },
  };
});
