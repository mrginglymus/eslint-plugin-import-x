import type { Options as SwcOptions } from '@swc/core'
import type { Config } from 'jest'

const testCompiled = process.env.TEST_COMPILED === '1'

export default {
  collectCoverage: !testCompiled,
  modulePathIgnorePatterns: ['<rootDir>/test/fixtures/with-syntax-error'],
  testEnvironmentOptions: {
    customExportConditions: testCompiled ? undefined : ['epix'],
  },
  snapshotSerializers: ['<rootDir>/test/jest.serializer.ts'],
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['@swc-node/jest', {} satisfies SwcOptions],
  },
} satisfies Config
