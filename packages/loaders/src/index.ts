import { Loader } from '@graphql-tools/utils';
import { ApolloEngineLoader } from '@graphql-tools/apollo-engine-loader';
import { CodeFileLoader } from '@graphql-tools/code-file-loader';
import { GitLoader } from '@graphql-tools/git-loader';
import { GithubLoader } from '@graphql-tools/github-loader';
import { PrismaLoader } from '@graphql-tools/prisma-loader';
import { UrlLoader } from '@graphql-tools/url-loader';

export const loaders: Loader[] = [
  new ApolloEngineLoader(),
  new CodeFileLoader(),
  new GitLoader(),
  new GithubLoader(),
  new PrismaLoader(),
  new UrlLoader(),
];
