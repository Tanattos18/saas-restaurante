import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/backend/(.*)$': '<rootDir>/src/backend/$1',
    '^@/frontend/(.*)$': '<rootDir>/src/frontend/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
}

export default config
