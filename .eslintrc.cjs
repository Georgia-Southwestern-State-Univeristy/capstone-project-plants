module.exports = {
    root: true,
    env: {
      node: true,
      es2020: true
    },
    extends: [
      'plugin:vue/vue3-essential',
      'eslint:recommended'
    ],
    globals: {
      google: 'readonly',
      globalThis: 'writable'
    }
  }