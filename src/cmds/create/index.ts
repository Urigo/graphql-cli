import * as Zip from 'adm-zip'
import chalk from 'chalk'
import commandExists = require('command-exists')
import * as gh from 'parse-github-url'
import { spawn } from 'cross-spawn'
import * as fs from 'fs'
import { padEnd } from 'lodash'
import * as path from 'path'
import * as request from 'request'
import * as tmp from 'tmp'
import * as rimraf from 'rimraf'

import { Context } from '../..'
import { defaultBoilerplates } from './boilerplates'
import { getZipInfo } from './utils'

export const command = 'create [directory]'
export const describe = 'Bootstrap a new GraphQL project'

export const builder = {
  boilerplate: {
    alias: 'b',
    describe:
      'Full URL or repo shorthand (e.g. `owner/repo`) to boilerplate GitHub repository',
    type: 'string',
  },
  'no-install': {
    describe: `Don't install project dependencies`,
    type: 'boolean',
    default: false,
  },
}

function getGitHubUrl(boilerplate: string): string | undefined {
  const details = gh(boilerplate)

  if (details.host && details.owner && details.repo) {
    const branch = details.branch ? `/tree/${details.branch}` : ''
    return `https://${details.host}/${details.repo}${branch}`
  }
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

  // allow short handle boilerplate (e.g. `node-basic`)
  if (boilerplate && !boilerplate.startsWith('http')) {
    const matchedBoilerplate = defaultBoilerplates.find(
      b => b.name === boilerplate,
    )
    if (matchedBoilerplate) {
      boilerplate = matchedBoilerplate.repo
    } else {
      // allow shorthand GitHub URLs (e.g. `graphcool/graphcool-server-example`)
      boilerplate = getGitHubUrl(boilerplate)
    }
  }

  // interactive selection
  if (!boilerplate) {
    const maxNameLength = defaultBoilerplates
      .map(bp => bp.name.length)
      .reduce((max, x) => Math.max(max, x), 0)
    const choices = defaultBoilerplates.map(
      bp => `${padEnd(bp.name, maxNameLength + 2)} ${bp.description}`,
    )
    const { choice } = await context.prompt<{ choice: string }>({
      type: 'list',
      name: 'choice',
      message: `Choose GraphQL boilerplate project:`,
      choices,
    })

    boilerplate = defaultBoilerplates[choices.indexOf(choice)].repo
  }

  // download repo contents
  const zipInfo = getZipInfo(boilerplate!)
  const downloadUrl = zipInfo.url
  const tmpFile = tmp.fileSync()

  console.log(`[graphql create] Downloading boilerplate from ${downloadUrl}...`)

  await new Promise(resolve => {
    request(downloadUrl)
      .pipe(fs.createWriteStream(tmpFile.name))
      .on('close', resolve)
  })

  const zip = new Zip(tmpFile.name)
  zip.extractEntryTo(zipInfo.path, projectPath, false)
  tmpFile.removeCallback()

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
