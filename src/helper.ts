import * as core from '@actions/core'
import * as github from '@actions/github'
import * as io from '@actions/io'

export enum ObjectState {
    Release,
    Obselete,
    Outdated
}

export async function getFolderPath(root: string, type: string, name: string, state: ObjectState): Promise<string> {
    try {
        var path = require('path');
        var typePath: string = '';

        if (type.trim().toLowerCase() == 'object' ||
            type.trim().toLowerCase() == 'objects') {
            core.info("Content handled as an object")
            typePath = 'Objects'
        }
        else if (type.trim().toLowerCase() == 'peripheral' ||
            type.trim().toLowerCase() == 'peripherals') {
            core.info("Content handled as an peripheral")
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
export async function listCopyContent(workspacePath: string): Promise<string[]> {
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
        core.debug(`Searching in this path: ${workspacePath}`)
        var filenames: string[] = fs.readdirSync(workspacePath);
        core.info(`Found ${filenames.length} folder/files`)
        filenames.forEach(file => {
            if (re.test(file)) {
                var newFileName = core.toPlatformPath(path.join(workspacePath, file))
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
        // rethrow error
        throw error
    } finally {
        core.endGroup();
    }
}
export async function copyContentToNewDestination(files: string[], destinationPath: string)// : Promise<boolean>
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

        // rethrow error
        throw error
    } finally {
        core.endGroup();
    }

}