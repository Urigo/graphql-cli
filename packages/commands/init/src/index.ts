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
import { cosmiconfig } from 'cosmiconfig';

type StandardEnum<T> = {
    [id: string]: T | string;
    [nu: number]: string;
}

async function askForEnum<T, Enum extends StandardEnum<T>>(enumarator: Enum, message: string, defaultValue ?: T): Promise<T> {
    const { answer } = await prompt<{ answer: T }>([
        {
            type: 'list',
            name: 'answer',
            message,
            choices: Object.values(enumarator),
            default: defaultValue,
        }
    ]);
    return answer;
}
                    
enum InitializationType {
    FromScratch = 'I want to create a new project from a GraphQL CLI Project Template.',
    ExistingOpenAPI = 'I have an existing project using OpenAPI/Swagger Schema Definition.',
    ExistingGraphQL = 'I have an existing project using GraphQL and want to add GraphQL CLI (run from project root).'
}

enum ProjectType {
    FrontendOnly = 'Frontend only',
    BackendOnly = 'Backend only',
    FullStack = 'Full Stack',
}

enum FrontendType {
    TSReactApollo = 'TypeScript React Apollo',
    ApolloAngular = 'Apollo Angular',
    StencilApollo = 'Stencil Apollo',
    TSUrql = 'TypeScript Urql',
    GraphQLRequest = 'GraphQL Request',
    ApolloAndroid = 'Apollo Android',
    Other = 'Other',
}

enum BackendType {
    TS = 'TypeScript',
    Java = 'Java',
    Kotlin = 'Kotlin',
    Other = 'Other',
}

export const plugin: CliPlugin = {
    init({ program, reportError }) {
        program.
            command('init')
            .option('--projectName', 'Project name')
            .option('--templateName', 'Name of the predefined template')
            .option('--templateUrl', 'GitHub URL of the template. For example (http://github.com/ardatan/graphql-cli-example)')
            .action(async ({ projectName, templateName, templateUrl }: { projectName?: string, templateName?: string, templateUrl?: string }) => {
                try {

                    const initializationType = await askForEnum(InitializationType, 'Select the best option for you', InitializationType.FromScratch);

                    let graphqlConfig: any = {
                        extensions: {}
                    };

                    let projectPath = process.cwd();
                    let projectType: ProjectType;

                    if(initializationType === InitializationType.ExistingGraphQL) {
                        if (existsSync(join(projectPath, 'package.json'))) {
                            const { default: packageJson } = await import(join(projectPath, 'package.json'));
                            projectName = packageJson.name;
                        } else {
                            throw new Error(
                                `There is no valid NodeJS project in the current path;\n` +
                                `${projectPath}`
                            );
                        }
                        const codegenCosmiConfig = cosmiconfig('codegen');
                        const { config: codegenConfig, filepath: codegenFilePath, isEmpty } = await codegenCosmiConfig.search(projectPath);
                        if (!isEmpty) {
                            const { willBeMerged } = await prompt([
                                {
                                    type: 'confirm',
                                    name: 'willBeMerged',
                                    message: `GraphQL Code Generator configuration has been detected in ${codegenFilePath}.\n Do you want to use the same configuration with GraphQL CLI?`,
                                    default: true,
                                }
                            ]);
                            if (willBeMerged){
                                graphqlConfig.extensions.codegen = {};
                                for (const key in codegenConfig) {
                                    if (key === 'schema') {
                                        graphqlConfig.schema = codegenConfig.schema;
                                    } else if (key === 'documents') {
                                        graphqlConfig.documents = codegenConfig.documents;
                                    } else {
                                        graphqlConfig.extensions.codegen[key] = codegenConfig[key];
                                    }
                                }
                            }
                        }
                    }

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
                            projectType = await askForEnum(ProjectType, 'What is the type of the project?', ProjectType.FullStack);
                        }    

                        if (!templateName) {
                            const downloadingTemplateList = ora('Loading template list...').start();
                            const templateMap = await fetch('https://raw.githubusercontent.com/Urigo/graphql-cli/master/templates.json').then(res => res.json());
                            downloadingTemplateList.succeed();
                            const templateNames = Object.keys(templateMap).filter(templateName => templateMap[templateName].projectType === projectType);
                            const { templateName: enteredTemplateName } = await prompt<{ templateName: string }>([
                                {
                                    type: 'list',
                                    name: 'templateName',
                                    message: `Which template do you want to start with your new ${projectType} project?`,
                                    choices: [
                                        ...templateNames, 
                                        'Other Template'
                                    ],
                                }
                            ]);
                            if (enteredTemplateName === 'Other Template') {
                                const { templateUrl: enteredTemplateUrl } = await prompt([
                                    {
                                        type: 'input',
                                        name: 'templateUrl',
                                        message: 'Enter Git URL of the template. For example (https://github.com/ardatan/graphql-cli-fullstack-template)'
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
                        }
                    }

                    const graphqlConfigPath = join(projectPath, '.graphqlrc.yml');

                    try {
                        if (existsSync(graphqlConfigPath)) {
                            graphqlConfig  = YAML.parse(readFileSync(graphqlConfigPath, 'utf8'));
                        }
                    } catch (e) {}

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
                                default: './model'
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

                    if (projectType === ProjectType.FullStack && graphqlConfig.extensions.generate && !graphqlConfig.extensions.generate.folders.client) {
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
                    if (!graphqlConfig.documents && (projectType === ProjectType.FullStack || projectType === ProjectType.FrontendOnly)) {
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
                            if (projectType === ProjectType.FullStack || projectType === ProjectType.BackendOnly) {

                                const backendType = await askForEnum(BackendType, 'What type of backend do you use?', BackendType.TS);

                                switch (backendType) {
                                    case BackendType.TS:
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-resolvers');
                                        break;
                                    case BackendType.Java:
                                        codegenPlugins.add('java');
                                        codegenPlugins.add('java-resolvers');
                                        break;
                                    case BackendType.Kotlin:
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

                                graphqlConfig.extensions.codegen[backendGeneratedFile] = {
                                    plugins: [...codegenPlugins],
                                };
                            }
                            if (projectType === ProjectType.FullStack || projectType === ProjectType.FrontendOnly) {

                                const frontendType = await askForEnum(FrontendType, 'What type of frontend do you use?', FrontendType.TSReactApollo);

                                switch (frontendType) {
                                    case FrontendType.TSReactApollo:
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-react-apollo');
                                        break;
                                    case FrontendType.ApolloAngular:
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-apollo-angular');
                                        break;
                                    case FrontendType.StencilApollo:
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-stencil-apollo');
                                        break;
                                    case FrontendType.TSUrql:
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-urql');
                                        break;
                                    case FrontendType.GraphQLRequest:
                                        codegenPlugins.add('typescript');
                                        codegenPlugins.add('typescript-graphql-request');
                                        break;
                                    case FrontendType.ApolloAndroid:
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

                                graphqlConfig.extensions.codegen[frontendGeneratedFile] = {
                                    plugins: [...codegenPlugins],
                                };
                            }
                            npmPackages.push(...[...codegenPlugins].map(plugin => '@graphql-codegen/' + plugin));
                        }
                    }

                    if (projectType === ProjectType.FullStack || projectType === ProjectType.FrontendOnly) {
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

                    if (projectType === ProjectType.FullStack || projectType === ProjectType.BackendOnly) {
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

                    let packageJson: any = {};
                    try {
                        const importedPackageJson = await import(join(projectPath, 'package.json'));
                        packageJson = importedPackageJson.default || importedPackageJson || {};
                    } catch (err) { }

                    packageJson.name = projectName;

                    packageJson.devDependencies = packageJson.devDependencies || {};
                    for (const npmDependency of npmPackages) {
                        packageJson.devDependencies[npmDependency] = 'canary';
                    }

                    await ensureFile(join(projectPath, 'package.json'));
                    writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

                    console.info(
                        `🚀  GraphQL CLI project successfully initialized:\n` + 
                        `${projectPath}\n` +  
                        `Next Steps:\n` +
                        `- Change directory into project folder - ${chalk.cyan(`cd ${projectPath}`)}\n` +
                        (
                            initializationType !== InitializationType.ExistingGraphQL ?
                            `- Edit the .graphql file inside your model folder.\n` +
                            `- Run ${chalk.cyan(`yarn graphql generate`)} to generate schema and resolvers\n` +
                            `- Run ${chalk.cyan(`yarn graphql codegen`)} to generate TypeScript typings\n`
                            : ''
                        ) +
                        `- Install ${chalk.cyan(`yarn install`)} to install dependencies`
                    );
                    process.exit(0);
                } catch (e) {
                    reportError(e);
                }
            })
    }
};
