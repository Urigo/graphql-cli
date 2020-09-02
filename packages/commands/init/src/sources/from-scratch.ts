import { join } from 'path';
import { prompt } from 'inquirer';
import { Context } from '../common';
import { handler } from 'create-graphback';

export async function fromScratch({
  context,
  templateName,
  templateUrl,
}: {
  context: Context;
  templateName: string;
  templateUrl: string;
}) {
  if (!context.name) {
    const { projectName: enteredName } = await prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of the project?',
        default: 'my-graphql-project',
      },
    ]);
    context.name = enteredName;
    context.path = join(process.cwd(), context.name);
  }

  await handler({ name: context.name, templateName, templateUrl });
}
