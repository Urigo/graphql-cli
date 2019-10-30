# Contributing guide

We are using Yarn workspaces, so make sure you have the latest version of Yarn installed.

## Building project

To build the entire monorepo, start by installing the dependencies by running `yarn` in the root directory, and then:

```sh
yarn build
```

## Using command line tool from source

```sh
cd packages/cli
npm link .
```

