const { pathsToModuleNameMapper } = require('ts-jest');

/** @type {import('ts-jest').JestConfigWithTsJest} */
const jestConfig = {
  preset: "ts-jest",
  testEnvironment: 'node',
  verbose: true,
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: pathsToModuleNameMapper({
    "$types/*": [
      "./src/types/*"
    ]
  })
};

module.exports = jestConfig;