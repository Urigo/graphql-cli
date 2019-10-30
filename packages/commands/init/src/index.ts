import { CliPlugin } from "@test-graphql-cli/common";
import { prompt } from 'inquirer';
import { join } from 'path';
import simpleGit from 'simple-git/promise';
import chalk from 'chalk';
import { ensureFile, writeFileSync, readFileSync } from 'fs-extra';
import YAML from 'yamljs';

const templateMap = {
    'graphql-cli-backend-template': {
        repository: 'git@github.com:ardatan/graphql-cli-backend-template.git',
        projectType: 'Backend only',
        graphqlConfig: {
            schema: './src/schema/**/*.ts',
            generate: {
                db: {
                    dbConfig: {
                        user: 'postgresql',
                        password: 'postgres',
                        database: 'users',
                        host: 'localhost',
                        port: 55432,
                    },
                    database: 'pg',
                },
                graphqlCRUD: {
                    create: true,
                    update: true,
                    findAll: true,
                    find: true,
                    delete: false,
                    subCreate: false,
                    subUpdate: false,
                    subDelete: false,
                    disableGen: false,
                },
                folders: {
                    model: './model',
                    resolvers: './src/resolvers',
                    schema: './src/schema'
                },
            },
            codegen: {
                './src/generated-types.ts': {
                    'typescript': {},
                    'typescript-resolvers': {},
                }
            }
        }
    },
    'graphql-cli-fullstack-template': {
        repository: 'git@github.com:ardatan/graphql-cli-fullstack-template.git',
        projectType: 'Backend only',
        graphqlConfig: {
            schema: './server/src/schema/**/*.ts',
            documents: './client/src/graphql/**/*.ts',
            generate: {
                db: {
                    dbConfig: {
                        user: 'postgresql',
                        password: 'postgres',
                        database: 'users',
                        host: 'localhost',
                        port: 55432,
                    },
                    database: 'pg',
                },
                graphqlCRUD: {
                    create: true,
                    update: true,
                    findAll: true,
                    find: true,
                    delete: false,
                    subCreate: false,
                    subUpdate: false,
                    subDelete: false,
                    disableGen: false,
                },
                folders: {
                    model: './model',
                    resolvers: './server/src/resolvers',
                    schema: './server/src/schema',
                    client: './client/src/graphql'
                },
            },
            codegen: {
                './server/src/generated-types.ts': {
                    plugins: [
                        'typescript',
                        'typescript-resolvers'
                    ]
                },
                './client/src/generated-types.ts': {
                    plugins: [
                        'typescript',
                        'typescript-operations',
                        'typescript-react-apollo'
                    ],
                    config: {
                        withComponent: true,
                        withHOC:false,
                        withHooks: true,
                    }
                },
            }
        }
    }
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

                    let graphqlConfig: any = {};
                    let projectPath = process.cwd();
                    let projectType;

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
                                const selectedTemplate = templateMap[enteredTemplateName];
                                templateUrl = selectedTemplate.repository;
                                projectType = selectedTemplate.projectType;
                                graphqlConfig = selectedTemplate.graphqlConfig;
                            }
                            const git = simpleGit();
                            await git.clone(templateUrl, projectPath);
                            // unlinkSync(join(projectPath, '.git'));
                        }
                    }

                    if (!graphqlConfig.generate) {
                        const { isBackendGenerationAsked } = await prompt([
                            {
                                type: 'confirm',
                                name: 'isBackendGenerationAsked',
                                default: false,
                                message: 'Do you want to generate the backend code using a data model?',
                            }
                        ])
                        if (isBackendGenerationAsked) {
                            graphqlConfig.generate = {};
                        }
                    }

                    if (graphqlConfig.generate && !graphqlConfig.generate.folders) {
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
                        graphqlConfig.generate.folders = {
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

                        console.info(`Processing OpenAPI definition: ${openApiPath}`);
                        const schemaText: string = readFileSync(`${openApiPath}`, 'utf8');
                        let parsedObject;
                        if (openApiPath.endsWith('yaml') || openApiPath.endsWith('yml')) {
                            const YAML = await import('yamljs');
                            parsedObject = YAML.parse(schemaText);
                        } else {
                            parsedObject = JSON.parse(schemaText);
                        }
                        const datamodelPath = `${graphqlConfig.generate.model}/datamodel.graphql`;
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
                            console.info(`   Finished transforming OpenAPI definition: ${datamodelPath}`);
                        }
                        catch (err) {
                            console.info(`   Failed to process OpenAPI definition: ${datamodelPath}. Error: ${err}`);
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
                        graphqlConfig.schema = schema;
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

                    if (projectType === 'Full Stack' && graphqlConfig.generate && !graphqlConfig.generate.folders.client) {
                        const { client } = await prompt([
                            {
                                type: 'input',
                                name: 'client',
                                message: 'Where do you want to store your GraphQL operation documents?',
                                default: './client/graphql'
                            }
                        ])
                        graphqlConfig.generate.folders.client = client;
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
                    if (!graphqlConfig.codegen) {

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

                                graphqlConfig.codegen[frontendGeneratedFile] = [...codegenPlugins];
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
                    } catch (err) {}
                    packageJson.devDependencies = packageJson.devDependencies || {};
                    for (const npmDependency of npmPackages) {
                        packageJson.devDependencies[npmDependency] = 'latest';
                    }

                    await ensureFile(join(projectPath, 'package.json'));
                    writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

                    console.info(`GraphQL CLI project successfully initialized into the folder; ${projectPath} :rocket:
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
