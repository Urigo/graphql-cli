import { CliPlugin } from "@test-graphql-cli/common";
import { prompt } from 'inquirer';
import { join } from 'path';
import simpleGit from 'simple-git/promise';
import chalk from 'chalk';
import { ensureFile, writeFileSync } from 'fs-extra';
import YAML from 'yamljs';

const templateMap = {
    'graphql-cli-example': 'git@github.com:ardatan/graphql-cli-example.git'
};

export const plugin: CliPlugin = {
    init({ program, reportError }) {
        program.
            command('init')
            .option('--projectName', 'Project name')
            .option('--templateName', 'Name of the predefined template')
            .option('--templateUrl', 'GitHub URL of the template. For example (http://github.com/ardatan/graphql-cli-example#master)')
            .action(async ({ projectName, templateName, templateUrl }: { projectName?: string, templateName?: string, templateUrl?: string }) => {
                try {
                    const { isTemplate } = await prompt([
                        {
                            type: 'confirm',
                            name: 'isTemplate',
                            message: 'Do you already have a GraphQL project?',
                            default: false,
                        }
                    ]);

                    if (isTemplate) {
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
                    } else {
                        let graphqlConfig: any = {};
                        const { schema } = await prompt([
                            {
                                type: 'input',
                                name: 'schema',
                                message: 'Where is your schema?',
                                default: './schema.graphql',
                            }
                        ]);    
                        graphqlConfig.schema = schema;
                        const { projectType } = await prompt([
                            {
                                type: 'list',
                                name: 'projectType',
                                choices: [
                                    'Full Stack',
                                    'Backend only',
                                    'Frontend only'
                                ],
                                default: 'Backend only',
                            }
                        ]);
                        if (projectType === 'Full Stack' || projectType === 'Frontend only') {
                            const { documents } = await prompt([
                                {
                                    type: 'input',
                                    name: 'documents',
                                    message: 'Where are your operation documents?'
                                }
                            ]);
                            graphqlConfig.documents = documents;
                        }
                        let npmPackages = [
                            '@test-graphql-cli/cli'
                        ];
                        const { isCodegenAsked } = await prompt([
                            {
                                type: 'confirm',
                                message: 'Do you want to use GraphQL Code Generator?',
                                default: true,
                            }
                        ]);
                        if (isCodegenAsked) {
                            npmPackages.push('@test-graphql-cli/codegen');
                            graphqlConfig.codegen = {};
                            let codegenPlugins = new Set<string>();
                            if (projectType === 'Full Stack' || projectType === 'Backend only') {
                                const { backendType } = await prompt([
                                    {
                                        type: 'list',
                                        name: 'backendType',
                                        message: 'What type of backend do you have?',
                                        choices: [
                                            'TypeScript',
                                            'Java',
                                            'Kotlin'
                                        ]
                                    }
                                ]);
                                switch (backendType) {
                                    case 'TypeScript':
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-resolvers');
                                        break;
                                    case 'Java':
                                        codegenPlugins.add('java');
                                        codegenPlugins.add('java-resolvers');
                                        break;
                                    case 'Kotlin':
                                        codegenPlugins.add('java');
                                        codegenPlugins.add('java-kotlin');
                                        break;
                                }
                                
                                const { backendGeneratedFile } = await prompt([
                                    {
                                        type: 'input',
                                        name: 'backendGeneratedFile',
                                        message: 'Where do you want to have generated backend code?',
                                        default: './generated-backend.ts',
                                    }
                                ]);

                                graphqlConfig.codegen[backendGeneratedFile] = [...codegenPlugins];
                            }
                            if (projectType === 'Full Stack' || projectType === 'Frontend only') {

                                const { frontendType } = await prompt([
                                    {
                                        type: 'list',
                                        name: 'frontendType',
                                        choices: [
                                            'TypeScript React Apollo',
                                            'Apollo Angular',
                                            'Stencil Apollo',
                                            'TypeScript Urql',
                                            'GraphQL Request',
                                            'Apollo Android'
                                        ]
                                    }
                                ]);

                                switch (frontendType) {
                                    case 'TypeScript React Apollo':
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-react-apollo');
                                        break;
                                    case 'Apollo Angular':
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-apollo-angular');
                                        break;
                                    case 'Stencil Apollo':
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-stencil-apollo');
                                        break;
                                    case 'TypeScript Urql':
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-urql');
                                        break;
                                    case 'GraphQL Request':
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-graphql-request');
                                        break;
                                    case 'Apollo Android':
                                        codegenPlugins.add('java-apollo-android');
                                        break;
                                }

                                const { frontendGeneratedFile } = await prompt([
                                    {
                                        type: 'input',
                                        name: 'frontendGeneratedFile',
                                        message: 'Where do you want to have generated frontend code?',
                                        default: './generated-frontend.ts',
                                    }
                                ]);

                                graphqlConfig.codegen[frontendGeneratedFile] = [...codegenPlugins];
                            }
                            npmPackages.push(...[...codegenPlugins].map(plugin => '@graphql-codegen/' + plugin));
                        }

                        if (projectType === 'Full Stack' || projectType === 'Frontend only') {
                            const { isFrontendInspectorAsked } = await prompt([
                                {
                                    type: 'confirm',
                                    name: 'isFrontendInspectorAsked',
                                    message: 'Do you want to have GraphQL Inspector tools for frontend?',
                                    default: true,
                                }
                            ]);

                            if (isFrontendInspectorAsked) {
                                npmPackages.push('@test-graphql-cli/coverage', '@test-graphql-cli/validate');
                            }
                        }

                        if (projectType === 'Full Stack' || projectType === 'Backend only') {
                            const { isBackendInspectorAsked } = await prompt([
                                {
                                    type: 'confirm',
                                    name: 'isBackendInspectorAsked',
                                    message: 'Do you want to have GraphQL Inspector tools for frontend?',
                                    default: true,
                                }
                            ]);

                            if (isBackendInspectorAsked) {
                                npmPackages.push('@test-graphql-cli/diff', '@test-graphql-cli/serve', '@test-graphql-cli/similar');
                            }
                        }

                        const configPath = join(process.cwd(), '.graphqlrc.yml');
                        await ensureFile(configPath);
                        writeFileSync(
                            configPath,
                            YAML.stringify(graphqlConfig),
                        );
                        console.info(`Config file created at ${configPath}`);

                        const packageJson = await import(join(process.cwd(), 'package.json'));
                        packageJson.devDependencies = npmPackages;

                        console.info('Install `npm install` or `yarn install` to update dependencies!')

                        console.info('Initialization is finished!');
                    }

                } catch (e) {
                    reportError(e);
                }
            })
    }
};
