export default {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ],
  ignore: [
    "server/**/*.js",
    "server/**/*.ts"
  ]
};
