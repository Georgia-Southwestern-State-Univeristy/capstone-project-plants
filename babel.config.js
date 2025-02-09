module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: 'usage',
      corejs: 3,
      modules: 'auto'
    }]
  ],
  plugins: [
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime'
  ]
}