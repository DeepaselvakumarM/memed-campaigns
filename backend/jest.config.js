/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  // Integration tests start an in-memory MongoDB replica set; the first run downloads the binary.
  testTimeout: 60000,
  clearMocks: true,
};
