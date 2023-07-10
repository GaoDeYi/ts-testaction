import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import { copyContentToNewDestination, getFolderPath, listCopyContent } from './helper'

async function run(): Promise<void> {
    try {
        const repositoryName: string = core.getInput('repository-name')
        const destinationRoot: string = core.getInput('destination-root')
        const objectType: string = core.getInput('object-type')

        core.debug(`Working on repository name ${repositoryName}`)
        core.debug(`Destination root folder ${destinationRoot}`)
        core.debug(`Type of object: ${objectType}`)

        // decide where to copy
        var destination: string = await getFolderPath(destinationRoot, objectType, repositoryName)
        core.debug(`New path: ${destination}`)

        var folders: string[] = await listCopyContent()
        copyContentToNewDestination(folders, destination);

        core.setOutput("new-path", destination)

    } catch (error) {        
        if (error instanceof Error) {
            core.error(error.message)
            // core.setFailed(error.message)
        }
    }
}

run()
