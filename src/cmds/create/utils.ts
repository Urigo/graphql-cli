export interface ZipInfo {
  url: string
  path: string
}

export function getZipInfo(boilerplate: string): ZipInfo {
  let baseUrl = boilerplate
  let branch = 'master'
  let subDir = ''

  const branchMatches = boilerplate.match(/^(.*)\/tree\/([a-zA-Z-_]*)\/?(.*)$/)
  if (branchMatches) {
    baseUrl = branchMatches[1]
    branch = branchMatches[2]
    subDir = branchMatches[3]
  }

  if (subDir === undefined) {
    subDir = ''
  }

  if (!subDir.startsWith('/')) {
    subDir = '/' + subDir
  }
  if (!subDir.endsWith('/')) {
    subDir = subDir + '/'
  }

  const nameMatches = baseUrl.match(/github\.com\/(.*)\/(.*)$/)
  const repoName = nameMatches![2]

  const url = `${baseUrl}/archive/${branch}.zip`
  const path = `${repoName}-${branch}${subDir}`

  return { url, path }
}
