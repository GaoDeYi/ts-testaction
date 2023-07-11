import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'
import * as helper from './helper';

async function run(): Promise<void> {
    try {
        const fs = require('fs');

        var repositoryName: string | undefined = core.getInput('repository-name');
        const destinationRoot: string = core.getInput('destination-root');
        const objectType: string = core.getInput('object-type');
        const isObselete: boolean = core.getBooleanInput('is-obselete');
        const isOutdated: boolean = core.getBooleanInput('is-outdated');

        var objectState: helper.ObjectState = helper.ObjectState.Release;
        if (isObselete && !isOutdated) objectState = helper.ObjectState.Obselete;
        else if (!isObselete && isOutdated) objectState = helper.ObjectState.Outdated;

        if (repositoryName === undefined || repositoryName.length == 0) {
            repositoryName = github.context.repo.repo;
        }

        core.startGroup('Input information');
        core.info(`Working on repository name ${repositoryName}`)
        core.info(`Destination root folder ${destinationRoot}`)
        core.info(`Type of object: ${objectType}`)
        switch (objectState) {
            case helper.ObjectState.Obselete: {
                core.info(`Object state: Obselete`)
                break;
            }
            case helper.ObjectState.Outdated: {
                core.info(`Object state: Outdated`)
                break;
            }
            default: {
                core.info(`Object state: Release`)
                break;
            }
        }
        core.endGroup();

        // decide where to copy
        var destination: string = await helper.getFolderPath(destinationRoot, objectType, repositoryName, objectState)
        core.debug(`New path: ${destination}`)

        const workspacePath: string = process.env['GITHUB_WORKSPACE'] as string
        if (workspacePath.length == 0 || !fs.existsSync(workspacePath)) {
            throw new Error("GITHUB_WORKSPACE Path not set to a correct folder")
        }

        var folders: string[] = await helper.listCopyContent(workspacePath)
        helper.copyContentToNewDestination(folders, destination);

        core.setOutput("new-path", destination)

    } catch (error) {        
        if (error instanceof Error) {
            core.error(error.message)
            // core.setFailed(error.message)
        }
    }
}

async function getFolderPath(root: string, type: string, name: string): Promise<string> {
    try {
        var path = require('path');
        var typePath: string = '';

        if (type.trim().toLowerCase() == 'object' ||
            type.trim().toLowerCase() == 'objects') {
            core.info("Content treat as an object")
            typePath = 'Objects'
        }
        else if (type.trim().toLowerCase() == 'peripheral' ||
            type.trim().toLowerCase() == 'peripherals') {
            core.info("Content treat as an peripheral")
            typePath = 'Peripherals'
        }
        else {
            throw new Error('Object type needs to be one of the following: object, objects, peripheral, peripherals')
        }        

        var x = core.toPlatformPath(path.join(root, typePath, name));
        return x
    }
    catch (error) {
        // rethrow error
        throw error
    }
}
async function listCopyContent(): Promise<string[]> {
    var results: string[] = [];
    try {
        core.startGroup('Folders to copy')
        const fs = require('fs');
        var path = require('path');

        const testFolder = process.env['GITHUB_WORKSPACE'];
        if (!fs.existsSync(testFolder)) {
            throw new Error("GITHUB_WORKSPACE Path not set to a correct folder")
        }

        var re = new RegExp('^V\\d+\\.\\d+', 'i');
        core.debug(`Searching in this path: ${testFolder}`)
        var filenames: string[] = fs.readdirSync(testFolder);
        core.info(`Found ${filenames.length} folder/files`)
        filenames.forEach(file => {
            if (re.test(file)) {
                var newFileName = core.toPlatformPath(path.join(testFolder, file))
                if (fs.lstatSync(newFileName).isDirectory()) {
                    core.info(`Added ${file} to copy list`)
                    core.debug(`${file} folder leads to ${newFileName} path`)
                    results.push(newFileName)
                }
            }
        })
        core.info(`Choose ${results.length} folders for copy`)

        return results
    } catch (error) {
        core.endGroup();
        // rethrow error
        throw error
    } finally {
        core.endGroup();
    }
}
async function copyContentToNewDestination(files: string[], destinationPath: string)// : Promise<boolean>
{
    var results: string[] = [];
    try {
        const fs = require('fs');
        var path = require('path');

        // Clean folder before copy
        if (fs.existsSync(destinationPath)) {
            core.warning(`Removing ${destinationPath} and content because it exists`)
            await io.rmRF(destinationPath)
        }
        // Copy new content
        core.startGroup('Copy operation')

        core.info(`Creating ${destinationPath}`)

        await io.mkdirP(destinationPath)

        const options = { recursive: true, force: false }
        
        files.forEach(oldPath => {
            var newPath: string = core.toPlatformPath(path.join(destinationPath, path.basename(oldPath)))

            core.info(`Copy ${oldPath} to ${newPath}`)

            io.cp(oldPath, newPath, options)
        })
        // // Check folders copied
        // var copied: string[] = fs.readdirSync(destinationPath)
        // return (copied.length === files.length)

    } catch (error) {
        core.error(`At least one folder was not copied`)
        core.endGroup();

        // rethrow error
        throw error
    } finally {
        core.endGroup();
    }

}

run()
