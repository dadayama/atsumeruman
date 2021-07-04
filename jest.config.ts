export default {
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+ts', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}
