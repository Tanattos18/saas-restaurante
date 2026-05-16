/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '..',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/backend/(.*)$': '<rootDir>/src/backend/$1',
    '^@/frontend/(.*)$': '<rootDir>/src/frontend/$1',
    '^jose$': '<rootDir>/__mocks__/jose.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: false,
    }],
  },
}

module.exports = config
