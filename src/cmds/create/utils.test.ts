import test from 'ava'
import { getZipInfo } from './utils'

test('default', t => {
  t.deepEqual(getZipInfo('https://github.com/graphcool/boilerplate'), {
    url: 'https://github.com/graphcool/boilerplate/archive/master.zip',
    path: 'boilerplate-master/',
  })
})

test('branch', t => {
  t.deepEqual(getZipInfo('https://github.com/graphcool/boilerplate/tree/dev'), {
    url: 'https://github.com/graphcool/boilerplate/archive/dev.zip',
    path: 'boilerplate-dev/',
  })
})

test('sub dir', t => {
  t.deepEqual(
    getZipInfo('https://github.com/graphcool/boilerplate/tree/dev/src/tests'),
    {
      url: 'https://github.com/graphcool/boilerplate/archive/dev.zip',
      path: 'boilerplate-dev/src/tests/',
    },
  )
})
