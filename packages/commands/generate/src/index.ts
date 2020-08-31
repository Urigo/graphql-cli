import { defineCommand } from '@graphql-cli/common';
import { command, builder as builderConfig, handler } from 'graphback-cli';

export default defineCommand(() => {
  return {
    command,
    builder(builder: any) {
      return builder.options(builderConfig);
    },
    handler,
  };
});
