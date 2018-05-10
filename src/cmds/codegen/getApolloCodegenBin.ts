import * as path from 'path'
import * as fs from 'fs-extra'
import { getBinPath } from './getBin'

export default async function getApolloCodegenBin(): Promise<string> {
  let binPath = path.join(
    __dirname,
    '../../node_modules/apollo-codegen/lib/cli.js',
  )

  if (!fs.pathExistsSync(binPath)) {
    binPath = path.join(
      __dirname,
      '../../../../node_modules/apollo-codegen/lib/cli.js',
    )
  }

  if (!fs.pathExistsSync(binPath)) {
    binPath = path.join(__dirname, '../../../apollo-codegen/lib/cli.js')
  }

  if (!fs.pathExistsSync(binPath)) {
    binPath = (await getBinPath('apollo-codegen')) || 'apollo-codegen'
  }

  return binPath
}
