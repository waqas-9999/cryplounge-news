/**
 * Jest configuration.
 *
 * `jest` and `ts-jest` were already dependencies and `npm test` already pointed
 * at jest, but no configuration existed — so the suite could never run, which
 * is why the repository had no spec files. This is the missing piece rather
 * than a new tool choice.
 *
 * Scoped to `src/` unit specs. Nothing here touches the database or the
 * network, so `npm test` is safe to run against a working tree at any time.
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  // Mirrors the `@/*` path alias in tsconfig so specs import the way source does.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  clearMocks: true,
};
