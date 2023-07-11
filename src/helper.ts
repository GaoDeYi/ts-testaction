import * as core from '@actions/core'
import * as io from '@actions/io'
import * as fs from 'fs'
import * as path from 'path'

export enum ObjectState {
  Release,
  Obselete,
  Outdated
}

export async function getFolderPath(
  root: string,
  type: string,
  name: string,
  state: ObjectState
): Promise<string> {
  try {
    core.startGroup('Determine folder path')
    let typePath = ''

    if (
      type.trim().toLowerCase() === 'object' ||
      type.trim().toLowerCase() === 'objects'
    ) {
      core.info('Content handled as an object')
      typePath = 'Objects'
    } else if (
      type.trim().toLowerCase() === 'peripheral' ||
      type.trim().toLowerCase() === 'peripherals'
    ) {
      core.info('Content handled as an peripheral')
      typePath = 'Peripherals'
    } else {
      core.error(`Wrong object type: ${type}`)
      throw new Error(
        'Object type needs to be one of the following: object, objects, peripheral, peripherals'
      )
    }
    switch (state) {
      case ObjectState.Obselete: {
        const destination = core.toPlatformPath(
          path.join(root, typePath, '_obselete', name)
        )
        core.info(`New destination path: ${destination}`)
        return destination
      }
      case ObjectState.Outdated: {
        const destination = core.toPlatformPath(
          path.join(root, typePath, '_outdated', name)
        )
        core.info(`New destination path: ${destination}`)
        return destination
      }
      default: {
        const destination = core.toPlatformPath(path.join(root, typePath, name))
        core.info(`New destination path: ${destination}`)
        return destination
      }
    }
  } catch (error) {
    // rethrow error
    throw error
  } finally {
    core.endGroup()
  }
}
export async function listCopyContent(
  workspacePath: string
): Promise<string[]> {
  const results: string[] = []
  try {
    core.startGroup('Folders to copy')

    const testFolder: string = process.env['GITHUB_WORKSPACE'] as string
    if (!fs.existsSync(testFolder)) {
      throw new Error('GITHUB_WORKSPACE Path not set to a correct folder')
    }

    const regEx = new RegExp('^V\\d+\\.\\d+', 'i')
    core.debug(`Searching in this path: ${workspacePath}`)
    const filenames: string[] = fs.readdirSync(workspacePath)
    core.info(`Found ${filenames.length} folder/files`)

    for (const file of filenames) {
      if (regEx.test(file)) {
        const newFileName = core.toPlatformPath(path.join(workspacePath, file))
        if (fs.lstatSync(newFileName).isDirectory()) {
          core.info(`Added ${file} to copy list`)
          core.debug(`${file} folder leads to ${newFileName} path`)
          results.push(newFileName)
        }
      }
    }
    core.info(`Choose ${results.length} folders for copy`)

    return results
  } catch (error) {
    // rethrow error
    throw error
  } finally {
    core.endGroup()
  }
}
export async function copyContentToNewDestination(
  files: string[],
  destinationPath: string
): Promise<void> {
  try {
    // Clean folder before copy
    if (fs.existsSync(destinationPath)) {
      core.warning(`Removing ${destinationPath} and content because it exists`)
      await io.rmRF(destinationPath)
    }
    // Copy new content
    core.startGroup('Copy operation')

    core.info(`Creating ${destinationPath}`)

    await io.mkdirP(destinationPath)

    const options = {recursive: true, force: false}

    for (const oldPath of files) {
      const newPath: string = core.toPlatformPath(
        path.join(destinationPath, path.basename(oldPath))
      )

      core.info(`Copy ${oldPath} to ${newPath}`)

      io.cp(oldPath, newPath, options)
    }
    // // Check folders copied
    // var copied: string[] = fs.readdirSync(destinationPath)
    // return (copied.length === files.length)
  } catch (error) {
    core.error(`At least one folder was not copied`)

    // rethrow error
    throw error
  } finally {
    core.endGroup()
  }
}
