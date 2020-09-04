// tslint:disable-next-line: match-default-export-name no-implicit-dependencies
import ava, { ExecutionContext } from 'ava';
import { resolve } from 'path';
import { execSync } from 'child_process';

ava('Test cli workflow', (t: ExecutionContext) => {
  const basePath = resolve(`${__dirname}/../test-project`);
  process.chdir(basePath);
  // Workaround for github actions symlinking issue
  const graphQLCmd = 'node ../../packages/cli/dist/index.js';
  console.log(`Running commands in ${basePath}`);
  try {
    let generate = execSync(`${graphQLCmd} generate --backend`, { encoding: 'utf8', cwd: basePath });
    const codegen = execSync(`${graphQLCmd} codegen`, { encoding: 'utf8', cwd: basePath });

    console.log(`
    Generate: ${generate}\n
    Codegen: ${codegen}\n
   `);
    t.true(codegen.indexOf('error') === -1);
    t.true(generate.indexOf('failed') === -1);
  } catch (error) {
    t.fail(`build failed with ${error}`);
  }
});
