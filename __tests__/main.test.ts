import * as core from '@actions/core'
import * as github from '@actions/github'
import { context } from '@actions/github'
import * as helper from '../src/helper'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import { jest } from '@jest/globals'
import { expect, test, describe, afterEach, beforeEach } from '@jest/globals'

jest.mock('@actions/core');
jest.mock('@actions/github')

var mockedFetch: jest.MockedFunction<typeof core.toPlatformPath>;

describe('Function getFolderPath', () => {

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();

        // update the mock
        mockedFetch = core.toPlatformPath as jest.MockedFunction<typeof core.toPlatformPath>;
        mockedFetch.mockImplementation((path: string): string => path);
    });

    const validObjectType = [
        { type: 'objects' },
        { type: 'object' },
        { type: 'peripherals' },
        { type: 'peripheral' }
    ];
    const invalidObjectType = [
        { type: 'blabla' },
        { type: 'test' },
        { type: 'obselete' },
        { type: '' }
    ];

    test.each(validObjectType)('\'$type\' is a valid object-type', async ({ type }) => {
        const path: string = 'C:\\temp\\';
        const name: string = 'Name';
        await expect(() => helper.getFolderPath(path, type, name)).not.toThrow(Error);
    });
    test.each(invalidObjectType)('\'$type\' is an invalid object-type', async ({ type }) => {
        const path: string = 'C:\\temp\\';
        const name: string = 'Name';

        await expect(() => helper.getFolderPath(path, type, name)).rejects.toThrow(Error);
    });
    test('path is build correctly', async () => {
        const path: string = 'C:\\temp\\';
        const objectType: string = 'Object';
        const name: string = 'TestName';

        await expect(helper.getFolderPath(path, objectType, name)).resolves.toBe('C:\\temp\\Objects\\TestName');
        await expect(mockedFetch).toHaveBeenCalled()
    });
}) 

// shows how the runner will run a javascript action with env / stdout protocol
// test('test runs', () => {
//     process.env['INPUT_REPOSITORY-NAME'] = 'ATMOxTest'
//     process.env['INPUT_DESTINATION-ROOT'] = 'F:\\GitHubTest'
//     process.env['INPUT_OBJECT-TYPE'] = 'Objects'
// 
//     process.env['GITHUB_PATH'] = 'F:\\GitHubTest\\xyu'
// 
//     const np = process.execPath
//     const ip = path.join(__dirname, '..', 'lib', 'main.js')
//     const options: cp.ExecFileSyncOptions = {
//       env: process.env
//     }
//     console.log(cp.execFileSync(np, [ip], options).toString())
// })
