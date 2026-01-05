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
  // Playwright specs live under /e2e and are run via `npm run test:e2e`.
  // Jest should only run unit/integration tests.
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(next-intl|use-intl)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^.+\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '^next/image$': '<rootDir>/__mocks__/nextImageMock.js',
    '^next-intl$': '<rootDir>/__mocks__/nextIntlMock.js',
  },
};

module.exports = createJestConfig(customJestConfig);
