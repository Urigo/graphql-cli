import { defineCommand } from '@graphql-cli/common';
import open from 'open';

export default defineCommand(() => {
  return {
    command: 'discover',
    describe: 'Opens a list of all GraphQL CLI Plugins',
    handler() {
      return open('https://www.npmjs.com/search?q=keywords:graphql-cli-plugin');
    },
  };
});
