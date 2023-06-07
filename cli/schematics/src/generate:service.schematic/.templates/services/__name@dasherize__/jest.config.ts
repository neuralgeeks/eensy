import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from './tsconfig.json'

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '.+\\.ts$': 'ts-jest',
  },
  testSequencer: '<rootDir>/tests/jest/sequencer.js',
  globalSetup: '<rootDir>/tests/jest/setup.ts',
  globalTeardown: '<rootDir>/tests/jest/teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/jest/setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
}
