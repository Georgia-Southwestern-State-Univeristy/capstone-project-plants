module.exports = {
    moduleFileExtensions: ['js', 'vue'],
    transform: {
      '^.+\\.vue$': 'vue-jest',
      '^.+\\.js$': 'babel-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: ['**/tests/unit/**/*.spec.js'],
    setupFiles: ['./tests/unit/setup.js']
  }