import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],
  modulePaths: ["<rootDir>/node_modules"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/../../shared/src/$1",
    "^@users/(.*)$": "<rootDir>/src/modules/users/$1",
    "^@auth/(.*)$": "<rootDir>/src/modules/auth/$1",
    "^@preferences/(.*)$": "<rootDir>/src/modules/preferences/$1",
    "^@subscriptions/(.*)$": "<rootDir>/src/modules/subscriptions/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
};

export default config;
