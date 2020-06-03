import { CommandModule } from 'yargs';
import { loadConfig, GraphQLConfig } from 'graphql-config';
import { loadDocuments, loadSchema } from '@graphql-tools/load';
import { Loader } from '@graphql-tools/utils';
import { LoadConfigOptions } from './types';

export type CommandFactory<T = {}, U = {}> = (api: {
  useConfig: (options?: LoadConfigOptions) => Promise<GraphQLConfig>;
  useLoaders: typeof useLoaders;
}) => CommandModule<T, U>;

export function defineCommand<T = {}, U = {}>(factory: CommandFactory<T, U>) {
  return factory;
}

export function useConfig(options: LoadConfigOptions = {}) {
  return loadConfig({
    rootDir: process.cwd(),
    throwOnEmpty: true,
    throwOnMissing: true,
    ...options,
  });
}

type PointerOf<T extends (...args: any) => any> = Parameters<T>[0];
type OptionsOf<T extends (...args: any) => any> = Omit<Parameters<T>[1], 'loaders'>;

export function useLoaders({ loaders }: { loaders: Loader[] }) {
  return {
    loadDocuments(pointer: PointerOf<typeof loadDocuments>, options: OptionsOf<typeof loadDocuments>) {
      return loadDocuments(pointer, { loaders, ...options });
    },
    loadSchema(pointer: PointerOf<typeof loadSchema>, options: OptionsOf<typeof loadSchema>) {
      return loadSchema(pointer, { loaders, ...options });
    },
  };
}
