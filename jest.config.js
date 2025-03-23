export default {
  transform: {
    "^.+\\.m?[jt]sx?$": "babel-jest"
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "mjs", "json"],
  testMatch: ["**/tests/**/*.test.mjs"],
  setupFiles: ["<rootDir>/tests/setup.js"]
};
