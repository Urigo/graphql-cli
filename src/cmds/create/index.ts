// import * as Zip from 'adm-zip'
import chalk from 'chalk'
import commandExists = require('command-exists')
import * as creato from 'creato'
// import * as gh from 'parse-github-url'
import { spawn } from 'cross-spawn'
import * as fs from 'fs'
import { padEnd } from 'lodash'
import * as path from 'path'
// import * as request from 'request'
// import * as tmp from 'tmp'
import * as rimraf from 'rimraf'

import { Context } from '../..'
import { defaultBoilerplates } from './boilerplates'
// import { getZipInfo } from './utils'

export const command = 'create [directory]'
export const describe = 'Bootstrap a new GraphQL project'

export const builder = {
  boilerplate: {
    alias: 'b',
    describe:
      'Name of boilerplate or full URL to boilerplate on GitHub repository',
    type: 'string',
  },
  'no-install': {
    describe: `Don't install project dependencies`,
    type: 'boolean',
    default: false,
  },
}

export async function handler(
  context: Context,
  argv: {
    boilerplate?: string
    directory?: string
    noInstall: boolean
  },
) {
  let { boilerplate, directory, noInstall } = argv

  if (directory && directory.match(/[A-Z]/)) {
    console.log(
      `Project/directory name cannot contain uppercase letters: ${directory}`,
    )
    directory = undefined
  }

  if (!directory) {
    const { newDir } = await context.prompt<{ newDir: string }>({
      type: 'input',
      name: 'newDir',
      default: '.',
      message: 'Directory for new GraphQL project',
      validate: dir => {
        if (dir.match(/[A-Z]/)) {
          return `Project/directory name cannot contain uppercase letters: ${directory}`
        }
        return true
      },
    })

    directory = newDir
  }

  // make sure that project directory is empty
  const projectPath = path.resolve(directory!)

  if (fs.existsSync(projectPath)) {
    const allowedFiles = ['.git', '.gitignore']
    const conflictingFiles = fs
      .readdirSync(projectPath)
      .filter(f => !allowedFiles.includes(f))

    if (conflictingFiles.length > 0) {
      console.log(`Directory ${chalk.cyan(projectPath)} must be empty.`)
      return
    }
  } else {
    fs.mkdirSync(projectPath)
  }

  // interactive selection
  const maxNameLength = defaultBoilerplates
    .map(bp => bp.name.length)
    .reduce((max, x) => Math.max(max, x), 0)
  const choices = defaultBoilerplates.map(bp => {
    return {
      name: `${padEnd(bp.name, maxNameLength + 2)} ${bp.description}`,
      value: bp,
    }
  })

  let choice
  // interactive selection if boilerplate arg is not passed
  if (!boilerplate) {
    const { selected } = await context.prompt<{ selected: creato.Template }>({
      type: 'list',
      name: 'selected',
      message: `Choose GraphQL boilerplate project:`,
      choices,
    })
    choice = selected
  }

  if (boilerplate) {
    if (!boilerplate.startsWith('http')) {
      // Find the boilerplate based on the name
      choice = defaultBoilerplates.find(option => option.name === boilerplate)
    } else {
      // Or handle the boilerplate argument as repo URL
      choice = {
        repo: {
          branch: 'master',
          uri: boilerplate,
          path: '/minimal',
        },
      }
    }
  }

  const template = await creato.loadTemplate(choice, projectPath)

  if (template.status !== 'ok') {
    throw new Error(template.message)
  }

  // // download repo contents

  // const downloadUrl = zipInfo.url
  // const tmpFile = tmp.fileSync()

  // console.log(`[graphql create] Downloading boilerplate from ${downloadUrl}...`)

  // await new Promise(resolve => {
  //   request(downloadUrl)
  //     .pipe(fs.createWriteStream(tmpFile.name))
  //     .on('close', resolve)
  // })

  // const zip = new Zip(tmpFile.name)
  // zip.extractEntryTo(zipInfo.path, projectPath, false)
  // tmpFile.removeCallback()

  // run npm/yarn install
  if (!noInstall) {
    const subDirs = fs
      .readdirSync(projectPath)
      .map(f => path.join(projectPath, f))
      .filter(f => fs.statSync(f).isDirectory())
    const installPaths = [projectPath, ...subDirs]
      .map(dir => path.join(dir, 'package.json'))
      .filter(p => fs.existsSync(p))

    for (const packageJsonPath of installPaths) {
      process.chdir(path.dirname(packageJsonPath))
      console.log(
        `[graphql create] Installing node dependencies for ${packageJsonPath}...`,
      )
      if (commandExists.sync('yarn')) {
        await shell('yarn install')
      } else {
        await shell('npm install')
      }
    }
  }

  // change dir to projectPath for install steps
  process.chdir(projectPath)

  // run & delete setup script
  let installPath = path.join(projectPath, 'install.js')
  if (!fs.existsSync(installPath)) {
    installPath = path.join(projectPath, '.install')
  }

  if (fs.existsSync(installPath)) {
    console.log(`[graphql create] Running boilerplate install script... `)
    const installFunction = require(installPath)

    await installFunction({
      context,
      project: path.basename(projectPath),
      projectDir: directory,
    })

    rimraf.sync(installPath)
  }
}

function shell(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const commandParts = command.split(' ')
    const cmd = spawn(commandParts[0], commandParts.slice(1), {
      cwd: process.cwd(),
      detached: false,
      stdio: 'inherit',
    })

    cmd.on('error', reject)
    cmd.on('close', resolve)
  })
}
