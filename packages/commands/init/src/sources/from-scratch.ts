import ora from 'ora';
import simpleGit from 'simple-git/promise';
import rimraf from 'rimraf';
import fetch from 'cross-fetch';
import tmp from 'tmp';
import { moveSync } from 'fs-extra';
import { join } from 'path';
import { prompt } from 'inquirer';
import { Context } from '../common';

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

  if (!templateName) {
    const downloadingTemplateList = ora('Loading template list...').start();
    const templateMap = await fetch(
      'https://raw.githubusercontent.com/Urigo/graphql-cli/master/templates.json'
    ).then((res) => res.json());
    downloadingTemplateList.succeed();
    const templateNames = Object.keys(templateMap).filter(
      (templateName) => templateMap[templateName].projectType === context.type
    );
    const { templateName: enteredTemplateName } = await prompt<{ templateName: string }>([
      {
        type: 'list',
        name: 'templateName',
        message: `Which template do you want to start with your new ${context.type} project?`,
        choices: [...templateNames, 'Other Template'],
      },
    ]);
    let subDirPath = '/';
    if (enteredTemplateName === 'Other Template') {
      const { templateUrl: enteredTemplateUrl } = await prompt([
        {
          type: 'input',
          name: 'templateUrl',
          message:
            'Enter Git URL of the template. For example (https://github.com/ardatan/graphql-cli-fullstack-template)',
        },
      ]);
      templateUrl = enteredTemplateUrl;
    } else {
      const selectedTemplate = templateMap[enteredTemplateName];
      templateUrl = selectedTemplate.repository;
      context.type = selectedTemplate.projectType;
      if (selectedTemplate.path) {
        subDirPath = selectedTemplate.path;
      }
    }
    const cloningSpinner = ora(`Cloning template repository from ${templateUrl}...`).start();
    const git = simpleGit().silent(true);
    const { name: tmpDir, removeCallback } = tmp.dirSync({ unsafeCleanup: true });

    await git.clone(templateUrl, tmpDir);

    rimraf.sync(join(tmpDir, '.git'));
    moveSync(join(tmpDir, subDirPath), context.path);

    removeCallback();
    cloningSpinner.stop();
  }
}
