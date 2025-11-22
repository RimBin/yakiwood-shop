/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

/**
 * Provide any custom config to be passed to Jest
 * see: https://jestjs.io/docs/configuration
 */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '^next/image$': '<rootDir>/__mocks__/nextImageMock.js',
  },
};

module.exports = createJestConfig(customJestConfig);
