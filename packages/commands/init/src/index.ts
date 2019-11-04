import { CliPlugin } from "@test-graphql-cli/common";
import { prompt } from 'inquirer';
import { join } from 'path';
import simpleGit from 'simple-git/promise';
import chalk from 'chalk';
import { ensureFile, writeFileSync, readFileSync, existsSync } from 'fs-extra';
import YAML from 'yamljs';
import rimraf from 'rimraf';
import fetch from 'cross-fetch';
import ora from 'ora';

const tryParseConfig = (graphqlConfigPath: string) => {
    try {
        if (existsSync(graphqlConfigPath)) {
            return YAML.parse(readFileSync(graphqlConfigPath, 'utf8'));
        } else {
            return false;
        }
    } catch (e) {
        return false;
    }
}

export const plugin: CliPlugin = {
    init({ program, reportError }) {
        program.
            command('init')
            .option('--projectName', 'Project name')
            .option('--templateName', 'Name of the predefined template')
            .option('--templateUrl', 'GitHub URL of the template. For example (http://github.com/ardatan/graphql-cli-example#master)')
            .action(async ({ projectName, templateName, templateUrl }: { projectName?: string, templateName?: string, templateUrl?: string }) => {
                try {
                    enum InitializationType {
                        FromScratch = 'I want to create a new project from a GraphQL CLI Project Template.',
                        ExistingOpenAPI = 'I have an existing project using OpenAPI/Swagger Schema Definition.',
                        ExistingGraphQL = 'I have an existing project using GraphQL and want to add GraphQL CLI (run from project root).'
                    }
                    const { initializationType } = await prompt<{ initializationType: InitializationType }>([
                        {
                            type: 'list',
                            name: 'initializationType',
                            message: 'Select the best option for you',
                            choices: Object.values(InitializationType),
                            default: InitializationType.FromScratch,
                        }
                    ]);

                    let graphqlConfig: any = {
                        extensions: {}
                    };
                    let projectPath = process.cwd();
                    let projectType: string;

                    if (initializationType === InitializationType.FromScratch) {
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
                            projectPath = join(process.cwd(), projectName);
                        }
                        if (!projectType) {
                            const { projectType: enteredProjectType } = await prompt([
                                {
                                    type: 'list',
                                    name: 'projectType',
                                    message: 'What is the type of your project?',
                                    choices: [
                                        'Full Stack',
                                        'Backend only',
                                        'Frontend only'
                                    ],
                                    default: 'Backend only',
                                }
                            ]);
                            projectType = enteredProjectType;
                        }    
                        if (!templateName) {
                            const downloadingTemplateList = ora('Loading template list...').start();
                            const templateMap = await fetch('https://raw.githubusercontent.com/Urigo/graphql-cli/master/templates.json').then(res => res.json());
                            downloadingTemplateList.succeed();
                            const templateNames = Object.keys(templateMap);
                            type TemplateName = keyof typeof templateMap;
                            const { templateName: enteredTemplateName } = await prompt<{ templateName: TemplateName | 'Other Template' }>([
                                {
                                    type: 'list',
                                    name: 'templateName',
                                    message: `Which template do you want to start with your new ${projectType} project?`,
                                    choices: [...templateNames.filter(templateName => templateMap[templateName].projectType === projectType), 'Other Template'],
                                }
                            ]);
                            if (enteredTemplateName === 'Other Template') {
                                const { templateUrl: enteredTemplateUrl } = await prompt([
                                    {
                                        type: 'input',
                                        name: 'templateUrl',
                                        message: 'Enter Git URL of the template. For example (https://github.com/ardatan/graphql-cli-fullstack-template#master)'
                                    }
                                ]);
                                templateUrl = enteredTemplateUrl;
                            } else {
                                const selectedTemplate = templateMap[enteredTemplateName];
                                templateUrl = selectedTemplate.repository;
                                projectType = selectedTemplate.projectType;
                            }
                            const cloningSpinner = ora(`Cloning template repository from ${templateUrl}...`).start();
                            const git = simpleGit().silent(true);
                            await git.clone(templateUrl, projectPath);
                            rimraf.sync(join(projectPath, '.git'));
                            cloningSpinner.stop();
                            const graphqlConfigPath = join(projectPath, '.graphqlrc.yml');
                            graphqlConfig = tryParseConfig(graphqlConfigPath) || graphqlConfig;
                        }
                    }

                    if (!graphqlConfig.extensions.generate) {
                        const { isBackendGenerationAsked } = await prompt([
                            {
                                type: 'confirm',
                                name: 'isBackendGenerationAsked',
                                default: false,
                                message: 'Do you want to generate the backend code using a data model?',
                            }
                        ])
                        if (isBackendGenerationAsked) {
                            graphqlConfig.extensions.generate = {};
                        }
                    }

                    if (graphqlConfig.extensions.generate && !graphqlConfig.extensions.generate.folders) {
                        const {
                            model,
                            resolvers,
                            schema,
                        } = await prompt([
                            {
                                type: 'input',
                                name: 'model',
                                message: 'Where are you going to store your data models?',
                                default: './models'
                            },
                            {
                                type: 'input',
                                name: 'resolvers',
                                message: 'Where are you going to store your resolvers?',
                                default: './server/src/resolvers'
                            },
                            {
                                type: 'input',
                                name: 'schema',
                                message: 'Where are you going to store your schema files?',
                                default: './server/src/schema'
                            }
                        ]);
                        graphqlConfig.extensions.generate.folders = {
                            model,
                            resolvers,
                            schema,
                        }
                    };


                    if (initializationType === InitializationType.ExistingOpenAPI) {
                        const { openApiPath } = await prompt<{ openApiPath: string }>([
                            {
                                type: 'input',
                                name: 'openApiPath',
                                message: 'Enter your OpenAPI schema path',
                                default: './swagger.json'
                            }
                        ]);

                        const processingOpenAPISpinner = ora(`Processing OpenAPI definition: ${openApiPath}`).start();
                        const schemaText: string = readFileSync(`${openApiPath}`, 'utf8');
                        let parsedObject;
                        if (openApiPath.endsWith('yaml') || openApiPath.endsWith('yml')) {
                            const YAML = await import('yamljs');
                            parsedObject = YAML.parse(schemaText);
                        } else {
                            parsedObject = JSON.parse(schemaText);
                        }
                        const datamodelPath = `${graphqlConfig.extensions.generate.model}/datamodel.graphql`;
                        try {
                            const { createGraphQlSchema } = await import('openapi-to-graphql');
                            let { schema } = await createGraphQlSchema(parsedObject, {
                                strict: true,
                                fillEmptyResponses: true,
                                equivalentToMessages: false,
                            });
                            const { printSchema } = await import('graphql');
                            const schemaString = printSchema(schema);

                            await ensureFile(datamodelPath);
                            writeFileSync(datamodelPath, schemaString);
                            processingOpenAPISpinner.succeed();
                        }
                        catch (err) {
                            processingOpenAPISpinner.fail(`Failed to process OpenAPI definition: ${datamodelPath}. Error: ${err}`);
                        }
                    }


                    if (!graphqlConfig.schema) {
                        const { schema } = await prompt([
                            {
                                type: 'input',
                                name: 'schema',
                                message: 'Where is your schema?',
                                default: './schema.graphql',
                            }
                        ]);
                        if (schema.endsWith('.ts')) {
                            graphqlConfig.schema = {
                                [schema]: {
                                    require: 'ts-node/register',
                                }
                            }
                        } else {
                            graphqlConfig.schema = schema;
                        }
                    }

                    if (projectType === 'Full Stack' && graphqlConfig.extensions.generate && !graphqlConfig.extensions.generate.folders.client) {
                        const { client } = await prompt([
                            {
                                type: 'input',
                                name: 'client',
                                message: 'Where do you want to store your GraphQL operation documents?',
                                default: './client/graphql'
                            }
                        ])
                        graphqlConfig.extensions.generate.folders.client = client;
                    }
                    if (!graphqlConfig.documents && (projectType === 'Full Stack' || projectType === 'Frontend only')) {
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
                        'graphql-cli'
                    ];
                    if (!graphqlConfig.extensions.codegen) {

                        const { isCodegenAsked } = await prompt([
                            {
                                type: 'confirm',
                                name: 'isCodegenAsked',
                                message: 'Do you want to use GraphQL Code Generator?',
                                default: true,
                            }
                        ]);
                        if (isCodegenAsked) {
                            npmPackages.push('@test-graphql-cli/codegen');
                            graphqlConfig.extensions.codegen = {};
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
                                            'Kotlin',
                                            'Other'
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

                                graphqlConfig.extensions.codegen[backendGeneratedFile] = [...codegenPlugins];
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
                                            'Apollo Android',
                                            'Other'
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

                                graphqlConfig.extensions.codegen[frontendGeneratedFile] = [...codegenPlugins];
                            }
                            npmPackages.push(...[...codegenPlugins].map(plugin => '@graphql-codegen/' + plugin));
                        }
                    }

                    if (projectType === 'Full Stack' || projectType === 'Frontend only') {
                        const { isFrontendInspectorAsked } = await prompt([
                            {
                                type: 'confirm',
                                name: 'isFrontendInspectorAsked',
                                message: 'Do you want to have GraphQL Inspector tools for your frontend?',
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
                                message: 'Do you want to have GraphQL Inspector tools for your backend?',
                                default: true,
                            }
                        ]);

                        if (isBackendInspectorAsked) {
                            npmPackages.push('@test-graphql-cli/diff', '@test-graphql-cli/serve', '@test-graphql-cli/similar');
                        }
                    }

                    const configPath = join(projectPath, '.graphqlrc.yml');
                    await ensureFile(configPath);
                    writeFileSync(
                        configPath,
                        YAML.stringify(graphqlConfig, Infinity),
                    );
                    console.info(`Config file created at ${configPath}`);

                    let packageJson: any = {};
                    try {
                        const importedPackageJson = await import(join(projectPath, 'package.json'));
                        packageJson = importedPackageJson.default || {};
                    } catch (err) { }

                    packageJson.name = projectName;

                    packageJson.devDependencies = packageJson.devDependencies || {};
                    for (const npmDependency of npmPackages) {
                        packageJson.devDependencies[npmDependency] = 'canary';
                    }

                    await ensureFile(join(projectPath, 'package.json'));
                    writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

                    console.info(`🚀  GraphQL CLI project successfully initialized into the folder; ${projectPath}
                  Next Steps:
                  - Change directory into project folder - ${chalk.cyan(`cd ${projectPath}`)}
                  - Install ${chalk.cyan(`yarn install`)} to install dependencies
                  ${initializationType !== InitializationType.ExistingGraphQL ? `
                  - Edit the .graphql file inside your model folder.
                  - Run ${chalk.cyan(`yarn graphql generate`)} to generate schema and resolvers
                  - Run ${chalk.cyan(`yarn graphql codegen`)} to generate TypeScript typings
                  ` : ''}
                `);

                } catch (e) {
                    reportError(e);
                }
            })
    }
};
