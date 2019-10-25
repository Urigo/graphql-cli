import { Command } from 'commander';
import { GraphQLExtensionDeclaration } from 'graphql-config';

export interface InitOptions {
  cwd: string;
  program: Command;
  reportError: (e: Error) => void;
  loadConfig: (loadConfigOptions?: LoadConfigOptions) => Promise<import('graphql-config').GraphQLProjectConfig>;
}

export interface CliPlugin {
  init(options: InitOptions): void | Promise<void>;
}

export interface LoadConfigOptions {
  filepath?: string;
  rootDir?: string;
  extensions?: GraphQLExtensionDeclaration[];
  throwOnMissing?: boolean;
  throwOnEmpty?: boolean;
}