import { join } from 'path';
import { ensureFile, writeFileSync } from 'fs-extra';
import { prompt } from 'inquirer';
import fullName from 'fullname';
import latestVersion from 'latest-version';

type StandardEnum<T> = {
  [id: string]: T | string;
  [nu: number]: string;
};

export async function askForEnum<T, Enum extends StandardEnum<T>>(options: {
  enum: Enum;
  message: string;
  defaultValue?: T;
  ignoreList?: (T | string)[];
}): Promise<T> {
  let choices: (T | string)[];
  const enumValues = Object.values(options.enum);
  if (options.ignoreList) {
    choices = enumValues.filter((enumValue) => !options.ignoreList.includes(enumValue));
  } else {
    choices = enumValues;
  }

  const { answer } = await prompt<{ answer: T }>([
    {
      type: 'list',
      name: 'answer',
      message: options.message,
      choices,
      default: options.defaultValue,
    },
  ]);
  return answer;
}

export interface Context {
  name: string;
  path: string;
  type?: ProjectType;
  graphqlConfig: any;
}

export enum InitializationType {
  FromScratch = 'I want to create a new project from a GraphQL CLI Project Template.',
  ExistingOpenAPI = 'I have an existing project using OpenAPI/Swagger Schema Definition.',
  ExistingGraphQL = 'I have an existing project using GraphQL and want to add GraphQL CLI (run from project root).',
}

export enum ProjectType {
  FullStack = 'Full Stack',
  FrontendOnly = 'Frontend only',
  BackendOnly = 'Backend only',
}

export enum FrontendType {
  TSReactApollo = 'TypeScript React Apollo',
  ApolloAngular = 'Apollo Angular',
  StencilApollo = 'Stencil Apollo',
  TSUrql = 'TypeScript Urql',
  GraphQLRequest = 'GraphQL Request',
  ApolloAndroid = 'Apollo Android',
  Other = 'Other',
}

export enum BackendType {
  TS = 'TypeScript',
  Java = 'Java',
  Kotlin = 'Kotlin',
  Other = 'Other',
}

export type PackageManifest = ReturnType<typeof managePackageManifest>;
export function managePackageManifest() {
  const packages = new Set<string>();
  const scripts = new Map<string, string>();

  return {
    addDependency(name: string) {
      packages.add(name);
    },
    addScript(name: string, script: string) {
      scripts.set(name, script);
    },
    async writePackage({
      path,
      name,
      initializationType,
    }: {
      path: string;
      name: string;
      initializationType: InitializationType;
    }) {
      let packageJson: any = {};
      const packageJsonPath = join(path, 'package.json');

      // Try to load existing package.json
      try {
        const importedPackageJson = require(packageJsonPath);

        packageJson = importedPackageJson || {};
      } catch (err) {}

      if (initializationType === InitializationType.FromScratch) {
        packageJson.private = true;
        packageJson.name = name;

        const author = await fullName();
        if (author) {
          packageJson.author = {
            name: author,
          };
        }
      }

      for (const [scriptName, scriptValue] of scripts) {
        if (!packageJson.scripts) {
          packageJson.scripts = {};
        }

        if (!packageJson.scripts[scriptName]) {
          packageJson.scripts[scriptName] = scriptValue;
        }
      }

      // Add dev dependencies
      packageJson.devDependencies = packageJson.devDependencies || {};

      for await (const npmDependency of packages) {
        if (!(npmDependency in packageJson.devDependencies)) {
          packageJson.devDependencies[npmDependency] = await latestVersion(npmDependency);
        }
      }

      await ensureFile(packageJsonPath);
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    },
  };
}
