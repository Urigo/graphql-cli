import { defineCommand } from '@graphql-cli/common';
import { serve } from 'graphql-serve';

export default defineCommand(() => {
  return {
    builder: (builder: any) => {
      serve.builder(builder);
      return builder;
    },
    command: serve.command,
    handler: serve.handler,
  };
});
