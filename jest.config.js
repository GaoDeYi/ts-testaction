process.env['INPUT_REPOSITORY-NAME'] = 'ATMOxTest'
process.env['INPUT_DESTINATION-ROOT'] = 'c:\\tmp\\gh'
process.env['INPUT_OBJECT-TYPE'] = 'Objects'

process.env['GITHUB_PATH'] = 'C:\\tmp\\xyu'
process.env['GITHUB_REPOSITORY'] = 'gaodeyi/ts-testaction'

module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true
}