import {wait} from '../src/wait'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import { GitHub } from '../node_modules/@actions/github/lib/utils'

test('throws invalid number', async () => {
  const input = parseInt('foo', 10)
  await expect(wait(input)).rejects.toThrow('milliseconds not a number')
})

test('wait 500 ms', async () => {
  const start = new Date()
  await wait(500)
  const end = new Date()
  var delta = Math.abs(end.getTime() - start.getTime())
  expect(delta).toBeGreaterThan(450)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
    process.env['INPUT_REPOSITORY-NAME'] = 'ATMOxTest'
    process.env['INPUT_DESTINATION-ROOT'] = 'F:\\GitHubTest'
    process.env['INPUT_OBJECT-TYPE'] = 'Objects'

    process.env['GITHUB_PATH'] = 'F:\\GitHubTest\\xyu'

    const np = process.execPath
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    const options: cp.ExecFileSyncOptions = {
      env: process.env
    }
    console.log(cp.execFileSync(np, [ip], options).toString())
})
