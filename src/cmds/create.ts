import { Context } from '../'
import * as fs from 'fs'
import * as path from 'path'
import * as tmp from 'tmp'
import * as request from 'request'
import * as Zip from 'adm-zip'
import { spawn } from 'child_process'
import commandExists = require('command-exists')

export const command = 'create <directory>'
export const describe =
  'Bootstrap a new GraphQL server'

export const builder = {
  template: {
    alias: 't',
    describe: 'Link to template GitHub repostiory',
    type: 'string',
  },
}

export async function handler(
  context: Context,
  argv: { template?: string; directory: string },
) {
  if (argv.directory.match(/[A-Z]/)) {
    console.log(
      `Project/directory name cannot contain uppercase letters: ${
        argv.directory
      }`,
    )
  }

  // make sure that project directory is empty
  const projectPath = path.resolve(argv.directory)

  if (fs.existsSync(projectPath)) {
    const allowedFiles = ['.git', '.gitignore']
    const conflictingFiles = fs
      .readdirSync(projectPath)
      .filter(f => !allowedFiles.includes(f))

    if (conflictingFiles.length > 0) {
      console.log(`Directory ${argv.directory} must be empty.`)
      return
    }
  } else {
    fs.mkdirSync(projectPath)
  }

  // determine template
  let { template } = argv
  if (!template) {
    const defaultTemplates = {
      'Basic (DB, Auth)':
        'https://github.com/graphcool/graphql-boilerplate/tree/alpha',
      'Serverless':
        'https://github.com/graphcool/graphcool-serverless-template',
    }
    const { templateName } = await context.prompt({
      type: 'list',
      name: 'templateName',
      message: `Choose GraphQL boilerplate:`,
      choices: Object.keys(defaultTemplates),
    })

    template = defaultTemplates[templateName]
  }

  // download repo contents
  const downloadUrl = getZipURL(template!)
  const tmpFile = tmp.fileSync()

  console.log(`Downloading template from ${downloadUrl}...`)

  await new Promise(resolve => {
    request(downloadUrl)
      .pipe(fs.createWriteStream(tmpFile.name))
      .on('close', resolve)
  })

  const zip = new Zip(tmpFile.name)
  zip.extractAllTo(projectPath)

  const zipFolderName = getZipFolderName(template!)
  const zipFolderPath = path.join(projectPath, zipFolderName)
  const files = fs.readdirSync(zipFolderPath)
  for (const file of files) {
    fs.renameSync(path.join(zipFolderPath, file), path.join(projectPath, file))
  }

  fs.rmdirSync(zipFolderPath)

  tmpFile.removeCallback()

  // change dir to projectPath for install steps
  process.chdir(projectPath)

  // run npm/yarn install
  if (await commandExists('yarn')) {
    console.log(`Installing node dependencies: $ yarn install`)
    await shell('yarn install')
  } else {
    console.log(`Installing node dependencies: $ npm install`)
    await shell('npm install')
  }

  // run & delete setup script
  const installPath = path.join(projectPath, 'install.js')
  if (fs.existsSync(installPath)) {
    const installFunction = require(installPath)
    await installFunction({ project: argv.directory })
    fs.unlinkSync(installPath)
  }
}

function getZipURL(template: string): string {
  let baseUrl = template
  let branch = 'master'

  const branchMatches = template.match(/^(.*)\/tree\/(.*)$/)
  if (branchMatches) {
    baseUrl = branchMatches[1]
    branch = branchMatches[2]
  }

  return `${baseUrl}/archive/${branch}.zip`
}

function getZipFolderName(template: string): string {
  let baseUrl = template
  let branch = 'master'

  const branchMatches = template.match(/^(.*)\/tree\/(.*)$/)
  if (branchMatches) {
    baseUrl = branchMatches[1]
    branch = branchMatches[2]
  }

  const nameMatches = baseUrl.match(/github\.com\/(.*)\/(.*)$/)
  const repoName = nameMatches![2]

  return `${repoName}-${branch}`
}

function shell(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const commandParts = command.split(' ')
    const cmd = spawn(commandParts[0], commandParts.slice(1), {
      cwd: process.cwd(),
      detached: true,
      stdio: 'inherit',
    })

    cmd.on('error', reject)
    cmd.on('close', resolve)
  })
}
