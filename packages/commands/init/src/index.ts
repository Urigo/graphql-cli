import { CliPlugin } from "@graphql-cli/common";
import { prompt } from 'inquirer';
import { join } from 'path';
import simpleGit from 'simple-git/promise';
import chalk from 'chalk';

const templateMap = {
    'graphql-cli-example': 'git@github.com:ardatan/graphql-cli-example.git'
};

export const plugin: CliPlugin = {
    init({ program, reportError }) {
        program.
            command('init')
            .option('--projectName', 'Project name')
            .option('--templateName', 'Name of the predefined template')
            .option('--templateUrl', 'GitHub URL of the template. For example (http://github.com/wtrocki/graphback-hapijs#master)')
            .action(async ({ projectName, templateName, templateUrl }: { projectName ?: string, templateName?: string, templateUrl?: string }) => {
                try {
                    if (!projectName) {
                        const { projectName: enteredName } = await prompt([
                            {
                                type: 'input',
                                name: 'projectName',
                                message: 'What is the name of the project?',
                                default: 'my-graphql-project'
                            }
                        ]);
                        projectName = enteredName;
                    }
                    if (!templateName) {
                        const templateNames = Object.keys(templateMap);
                        type TemplateName = keyof typeof templateMap;
                        const { templateName: enteredTemplateName } = await prompt<{ templateName: TemplateName | 'Other Template' }>([
                            {
                                type: 'list',
                                name: 'templateName',
                                message: 'Which template do you want to start with?',
                                choices: [...templateNames, 'Other Template'],
                            }
                        ]);
                        if (enteredTemplateName === 'Other Template') {
                            const { templateUrl: enteredTemplateUrl } = await prompt([
                                {
                                    type: 'input',
                                    name: 'templateUrl',
                                    message: 'Enter Git URL of the template. For example (git://github.com/wtrocki/graphback-example)',
                                    validate: async (value: string) => {
                                        if (value.startsWith('git:')) {
                                            return true;
                                        }
                                        return 'Please enter a valid Git URL';
                                    }
                                }
                            ]);
                            templateUrl = enteredTemplateUrl;
                        } else {
                            templateUrl = templateMap[enteredTemplateName];
                        }
                        const git = simpleGit();
                        const newProjectPath = join(process.cwd(), name);
                        await git.clone(templateUrl, newProjectPath);
                        const newRepoGit = simpleGit(newProjectPath);
                        await newRepoGit.removeRemote('origin');
                        console.info(`
                            GraphQL server successfully installed into the folder; /${name} :rocket:
                            Next Steps:
                            1. Change directory into project folder - ${chalk.cyan(`cd ${newProjectPath}`)}
                            2. Edit the .graphql file inside your model folder.
                            3. Run ${chalk.cyan(`graphql generate`)} to generate schema and resolvers
                            4. Run ${chalk.cyan(`graphql codegen`)} to generate TypeScript typings
                        `);
                    }
                } catch (e) {
                    reportError(e);
                }
            })
    }
};
