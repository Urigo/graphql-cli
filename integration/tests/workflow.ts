// tslint:disable-next-line: match-default-export-name no-implicit-dependencies
import ava, { ExecutionContext } from 'ava';
import { resolve } from 'path';
import { execSync } from 'child_process';


ava('Test cli workflow', (t: ExecutionContext) => {
  const basePath = resolve(`${__dirname}/../../templates/fullstack`);
  console.log(`Running commands in ${basePath}`)
  try {
    let generate = execSync('yarn graphql generate --backend', { encoding: 'utf8', cwd: basePath });
    generate += execSync('yarn graphql generate --client', { encoding: 'utf8', cwd: basePath });
    const codegen = 'disabled' // execSync('yarn graphql codegen', { encoding: 'utf8', cwd: basePath });

    console.log(`
    Generate: ${generate}\n
    Codegen: ${codegen}\n
   `)
  } catch (error) {
    t.fail(`build failed with ${error}`);
  }
});