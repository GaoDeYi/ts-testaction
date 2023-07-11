import * as core from '@actions/core'
import * as github from '@actions/github'
import * as helper from './helper'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    // const fs = await require('fs')

    let repositoryName: string | undefined = core.getInput('repository-name')
    const destinationRoot: string = core.getInput('destination-root')
    const objectType: string = core.getInput('object-type')
    const isObselete: boolean = core.getBooleanInput('is-obselete')
    const isOutdated: boolean = core.getBooleanInput('is-outdated')

    let objectState: helper.ObjectState = helper.ObjectState.Release
    if (isObselete && !isOutdated) objectState = helper.ObjectState.Obselete
    else if (!isObselete && isOutdated)
      objectState = helper.ObjectState.Outdated

    if (repositoryName === undefined || repositoryName.length === 0) {
      repositoryName = github.context.repo.repo
    }

    // Check again and quit if still empty
    if (repositoryName === undefined || repositoryName.length === 0) {
      core.error('No repository name found or given')
      core.setFailed('No repository name found or given')
    } else if (repositoryName.toLowerCase().startsWith('dev_')) {
      core.warning('This object is still under development')
      return
    }

    core.startGroup('Input information')
    core.info(`Working on repository name ${repositoryName}`)
    core.info(`Destination root folder ${destinationRoot}`)
    core.info(`Type of object: ${objectType}`)
    switch (objectState) {
      case helper.ObjectState.Obselete: {
        core.info(`Object state: Obselete`)
        break
      }
      case helper.ObjectState.Outdated: {
        core.info(`Object state: Outdated`)
        break
      }
      default: {
        core.info(`Object state: Release`)
        break
      }
    }
    core.endGroup()

    // decide where to copy
    const destination: string = await helper.getFolderPath(
      destinationRoot,
      objectType,
      repositoryName,
      objectState
    )
    core.debug(`New path: ${destination}`)

    const workspacePath: string = process.env['GITHUB_WORKSPACE'] as string
    if (workspacePath.length === 0 || !fs.existsSync(workspacePath)) {
      throw new Error('GITHUB_WORKSPACE Path not set to a correct folder')
    }

    const folders: string[] = await helper.listCopyContent(workspacePath)
    helper.copyContentToNewDestination(folders, destination)

    core.setOutput('new-path', destination)
  } catch (error) {
    if (error instanceof Error) {
      core.error(error.message)
      // core.setFailed(error.message)
    }
  }
}

run()
