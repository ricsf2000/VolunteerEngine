/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  testMatch: [
    '**/__tests__/**/*.test.{js,ts}',
    '**/*.test.{js,ts}'
  ],
  
  collectCoverageFrom: [
    'src/app/api/**/*.ts',
    'src/app/lib/**/*.ts',
    'src/auth.ts',
    'src/middleware.ts',
    '!**/*.d.ts',                    // Exclude type definitions
    '!**/node_modules/**',           // Exclude dependencies
  ],
  
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  
  // Transform ignore patterns for ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth)/)'
  ],
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next-auth$': '<rootDir>/__mocks__/next-auth.js',
    '^next-auth/(.*)$': '<rootDir>/__mocks__/next-auth.js'
  },
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  globalSetup: '<rootDir>/jest.globalSetup.js',
  globalTeardown: '<rootDir>/jest.globalTeardown.js',
  
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};