import { Command } from 'commander';
import { GraphQLProjectConfig, loadConfig } from 'graphql-config';

export interface InitOptions {
  cwd: string;
  program: Command;
  reportError: (e: Error | string) => void;
  loadConfig: (loadConfigOptions?: LoadConfigOptions) => Promise<GraphQLProjectConfig>;
}

export interface CliPlugin {
  init(options: InitOptions): void | Promise<void>;
}

export type LoadConfigOptions = Partial<Parameters<typeof loadConfig>[0]>;