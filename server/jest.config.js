/**
 * ===========================================
 * JEST CONFIG: Backend Test Configuration
 * ===========================================
 *
 * WHY THIS FILE EXISTS:
 * - Tells Jest how to find and run tests
 * - Sets the test environment to Node (not browser)
 * - Configures code coverage reporting
 * - Defines which files to ignore
 *
 * KEY CONCEPTS:
 * - testEnvironment: 'node' → tests run in Node.js (not jsdom)
 * - testMatch: tells Jest which files are tests
 * - coverageDirectory: where coverage reports go
 * - setupFilesAfterFramework: runs before each test file
 */

module.exports = {
  // Tests run in Node.js environment (we're testing a server)
  testEnvironment: 'node',

  // Find test files in __tests__ folders or files ending in .test.js
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.test.js',
  ],

  // Coverage report configuration
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude server entry point (just starts the server)
  ],
  coverageDirectory: 'coverage',

  // Clear mocks between tests (each test starts clean)
  clearMocks: true,

  // Timeout for each test (translation API tests may be slow)
  testTimeout: 10000,
};
