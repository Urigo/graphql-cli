import { CliPlugin } from "@test-graphql-cli/common";
import { prompt } from 'inquirer';
import { join } from 'path';
import simpleGit from 'simple-git/promise';
import chalk from 'chalk';
import { ensureFile, writeFileSync, readFileSync, existsSync, moveSync } from 'fs-extra';
import { safeLoad as YAMLParse, safeDump as YAMLStringify } from 'js-yaml';
import rimraf from 'rimraf';
import fetch from 'cross-fetch';
import ora from 'ora';
import { searchCodegenConfig } from './search-codegen-config';
import fullName from 'fullname';
import latestVersion from 'latest-version';
import tmp from 'tmp';

type StandardEnum<T> = {
    [id: string]: T | string;
    [nu: number]: string;
}

async function askForEnum<T, Enum extends StandardEnum<T>>(
    options: {
        enum: Enum,
        message: string,
        defaultValue?: T,
        ignoreList?: (T | string)[]
    }
): Promise<T> {
    let choices: (T | string)[];
    const enumValues = Object.values(options.enum);
    if (options.ignoreList) {
        choices = enumValues.filter(enumValue => !options.ignoreList.includes(enumValue))
    } else {
        choices = enumValues;
    }

    const { answer } = await prompt<{ answer: T }>([
        {
            type: 'list',
            name: 'answer',
            message: options.message,
            choices,
            default: options.defaultValue,
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
    FullStack = 'Full Stack',
    FrontendOnly = 'Frontend only',
    BackendOnly = 'Backend only'
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

                    let graphqlConfig: any = {
                        extensions: {}
                    };

                    let projectPath = process.cwd();
                    let projectType: ProjectType;

                    if (!projectType) {
                        projectType = await askForEnum({
                            enum: ProjectType,
                            message: 'What is the type of the project?',
                            defaultValue: ProjectType.FullStack
                        });
                    }

                    const initializationType = await askForEnum(
                        {
                            enum: InitializationType,
                            message: 'Select the best option for you',
                            defaultValue: InitializationType.FromScratch,
                            ignoreList: projectType === ProjectType.FrontendOnly ? [InitializationType.ExistingOpenAPI] : [],
                        }
                    );

                    let npmPackages = new Set<string>();

                    npmPackages.add('graphql-cli');

                    if (initializationType === InitializationType.ExistingGraphQL) {
                        if (existsSync(join(projectPath, 'package.json'))) {
                            const { default: packageJson } = await import(join(projectPath, 'package.json'));
                            projectName = packageJson.name;
                        }
                        const result = await searchCodegenConfig(projectPath);
                        if (result && !result.isEmpty) {
                            const codegenFilePath = result.filepath;
                            const { willBeMerged } = await prompt([
                                {
                                    type: 'confirm',
                                    name: 'willBeMerged',
                                    message: `GraphQL Code Generator configuration has been detected in ${codegenFilePath}.\n Do you want to use the same configuration with GraphQL CLI?`,
                                    default: true,
                                }
                            ]);
                            if (willBeMerged) {
                                npmPackages.add('@test-graphql-cli/codegen');
                                const codegenConfig = result.config;
                                graphqlConfig.extensions.codegen = {
                                    generates:{}
                                };
                                for (const key in codegenConfig) {
                                    if (key === 'schema') {
                                        graphqlConfig.schema = codegenConfig.schema;
                                    } else if (key === 'documents') {
                                        graphqlConfig.documents = codegenConfig.documents;
                                    } else {
                                        graphqlConfig.extensions.codegen[key] = codegenConfig[key];
                                    }
                                }
                                const removeOldCodegenConfigSpinner = ora('Removing old GraphQL Codegen configuration file').start();
                                rimraf.sync(result.filepath);
                                removeOldCodegenConfigSpinner.succeed();
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
                            let subDirPath = '/';
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
                                if (selectedTemplate.path) {
                                    subDirPath = selectedTemplate.path;
                                }
                            }
                            const cloningSpinner = ora(`Cloning template repository from ${templateUrl}...`).start();
                            const git = simpleGit().silent(true);
                            const { name: tmpDir, removeCallback } = tmp.dirSync();
                            await git.clone(templateUrl, tmpDir);
                            rimraf.sync(join(tmpDir, '.git'));
                            moveSync(join(tmpDir, subDirPath), projectPath);
                            removeCallback();
                            cloningSpinner.stop();
                        }
                    }

                    const graphqlConfigPath = join(projectPath, '.graphqlrc.yml');

                    try {
                        if (existsSync(graphqlConfigPath)) {
                            graphqlConfig = YAMLParse(readFileSync(graphqlConfigPath, 'utf8'));
                        }
                    } catch (e) {
                        console.warn(`Existing GraphQL Config file looks broken! Skipping...`);
                    }

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
                            parsedObject = YAMLParse(schemaText);
                        } else {
                            parsedObject = JSON.parse(schemaText);
                        }
                        const datamodelPath = `${graphqlConfig.extensions.graphback.model}/datamodel.graphql`;
                        try {
                            const { createGraphQLSchema } = await import('openapi-to-graphql');
                            let { schema } = await createGraphQLSchema(parsedObject, {
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
                            npmPackages.add('@test-graphql-cli/codegen');
                            graphqlConfig.extensions.codegen = {};
                            let codegenPlugins = new Set<string>();
                            if (projectType === ProjectType.FullStack || projectType === ProjectType.BackendOnly) {

                                const backendType = await askForEnum({
                                    enum: BackendType,
                                    message: 'What type of backend do you use?',
                                    defaultValue: BackendType.TS
                                });

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

                                graphqlConfig.extensions.codegen.generates[backendGeneratedFile] = {
                                    plugins: [...codegenPlugins],
                                };
                            }
                            if (projectType === ProjectType.FullStack || projectType === ProjectType.FrontendOnly) {

                                const frontendType = await askForEnum({
                                    enum: FrontendType,
                                    message: 'What type of frontend do you use?',
                                    defaultValue: FrontendType.TSReactApollo
                                });

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

                                graphqlConfig.extensions.codegen.generates[frontendGeneratedFile] = {
                                    plugins: [...codegenPlugins],
                                };
                            }
                            for (const codegenPlugin of codegenPlugins){
                                npmPackages.add('@graphql-codegen/' + codegenPlugin);
                            }
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
                            npmPackages.add('@test-graphql-cli/coverage');
                            npmPackages.add('@test-graphql-cli/validate');
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
                            npmPackages.add('@test-graphql-cli/diff');
                            npmPackages.add('@test-graphql-cli/serve'); 
                            npmPackages.add('@test-graphql-cli/similar');
                        }
                    }

                    const configPath = join(projectPath, '.graphqlrc.yml');
                    await ensureFile(configPath);
                    writeFileSync(
                        configPath,
                        YAMLStringify(graphqlConfig, {
                            sortKeys: (a, b) => {
                                if (a === 'schema') {
                                    return -1;
                                } else if (b === 'schema') {
                                    return 1;
                                } else if (a === 'documents') {
                                    return -1;
                                } else if (b === 'documents') {
                                    return 1;
                                } else if (a === 'extensions') {
                                    return 1;
                                } else if (b === 'extensions') {
                                    return -1;
                                } else {
                                    return a.localeCompare(b);
                                }
                            }
                        }),
                    );

                    let packageJson: any = {};
                    try {
                        const importedPackageJson = await import(join(projectPath, 'package.json'));
                        packageJson = importedPackageJson.default || importedPackageJson || {};
                    } catch (err) { }


                    if (InitializationType.FromScratch) {
                        packageJson.private = true;
                        packageJson.name = projectName;
                        const name = await fullName();
                        if (name) {
                            packageJson.author = {
                                name,
                            }
                        }
                    }

                    packageJson.devDependencies = packageJson.devDependencies || {};
                    const graphqlCliPackageJsonModule = require('graphql-cli/package.json');
                    const graphqlCliPackageJson = graphqlCliPackageJsonModule.default || graphqlCliPackageJsonModule;
                    for (const npmDependency of npmPackages) {
                        if (!(npmDependency in packageJson.devDependencies)) {
                            packageJson.devDependencies[npmDependency] = await latestVersion(npmDependency);
                        }
                    }

                    for (const devDependency in packageJson.devDependencies) {
                        if (devDependency.startsWith('@graphql-cli') || devDependency === 'graphql-cli') {
                            packageJson.devDependencies[devDependency] = graphqlCliPackageJson.version;
                        }
                    }

                    await ensureFile(join(projectPath, 'package.json'));
                    writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

                    console.info(
                        `🚀  GraphQL CLI project successfully initialized:\n` +
                        `${projectPath}\n` +
                        `Next Steps:\n` +
                        `- Change directory to the project folder - ${chalk.cyan(`cd ${projectPath}`)}\n` +
                        `- Run ${chalk.cyan(`yarn install`)} to install dependencies\n` +
                        (
                            initializationType !== InitializationType.ExistingGraphQL ?
                                `- ${chalk.cyan(`(Optional)`)} Initialize your git repo. ${chalk.cyan(`git init`)}.\n` +    
                                `- Follow the instructions in README.md to continue...\n`
                                : ''
                        )
                    );
                    process.exit(0);
                } catch (e) {
                    reportError(e);
                }
            })
    }
};
