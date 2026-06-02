// Config for the opt-in live smoke suite (hits production Schwab).
// Run with: npm run test:smoke  (requires ./schwab-token.json and .env creds)
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/smoke'],
  testMatch: ['**/*.smoke.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000,
};
