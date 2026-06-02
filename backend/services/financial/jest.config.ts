import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          moduleResolution: "node",
          resolvePackageJsonExports: false,
        },
      },
    ],
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/../../shared/src/$1",
    "^@users/(.*)$": "<rootDir>/src/modules/users/$1",
    "^@categories/(.*)$": "<rootDir>/src/modules/categories/$1",
    "^@cards/(.*)$": "<rootDir>/src/modules/cards/$1",
    "^@transactions/(.*)$": "<rootDir>/src/modules/transactions/$1",
    "^@balance/(.*)$": "<rootDir>/src/modules/balance/$1",
    "^@reconciliation/(.*)$": "<rootDir>/src/modules/reconciliation/$1",
    "^@sync/(.*)$": "<rootDir>/src/modules/sync/$1",
  },
};

export default config;
