module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false // Important: Use ES modules
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}