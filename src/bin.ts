import { installCommands } from './index';

installCommands()
  .demandCommand()
  .help()
  .completion('completion')
  .recommendCommands()
  .argv
