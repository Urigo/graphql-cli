// tslint:disable-next-line: match-default-export-name no-implicit-dependencies
import ava, { ExecutionContext } from 'ava';
import { resolve } from 'path';
const execa = require('execa');

ava('Test cli workflow', async (t: ExecutionContext) => {
  const basePath = resolve(`${__dirname}/../../templates/fullstack`);
  process.chdir(basePath)
    
  try {
    console.log(await execa('yarn', ['graphql', 'generate']));
    console.log(await execa('yarn', ['graphql', 'codegen']));
    console.log(await execa('yarn', ['schemats', 'generate']));
  } catch (error) {
    t.fail(`build failed with ${error}`);
  }
});