export default {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/prisma/seed.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testTimeout: 30000,
  // Aumentar memoria para workers y limitar concurrencia
  maxWorkers: 4,
  workerIdleMemoryLimit: '512MB',
  // Ejecutar tests en secuencia para evitar problemas de concurrencia en BD
  maxConcurrency: 1,
};
