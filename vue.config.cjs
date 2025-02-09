const webpack = require('webpack');
const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  outputDir: 'dist',
  configureWebpack: {
    entry: './src/main.js',
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      fallback: {
        "buffer": require.resolve("buffer/"),
        "process": require.resolve("process/browser"),
        "stream": require.resolve("stream-browserify"),
        "util": require.resolve("util/"),
        "crypto": require.resolve("crypto-browserify"),
        "assert": require.resolve("assert/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "fs": false,
        "path": require.resolve("path-browserify"),
        "querystring": require.resolve("querystring-es3"),
        "net": false,  // Not needed in browser
        "tls": false,  // Not needed in browser
        "zlib": false,
        "child_process": false,  // Not needed in browser
        "util": require.resolve("util/")

      },
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    plugins: [
      // Define global variables
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        'process.env': JSON.stringify(process.env)
      }),
      // Provide polyfills
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: false
      }
    }
  },
  
  chainWebpack: config => {
    // Configure babel-loader
    config.module
      .rule('js')
      .test(/\.js$/)
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        presets: [
          ['@vue/cli-plugin-babel/preset', {
            useBuiltIns: 'usage',
            corejs: 3,
            modules: false // Important: This ensures ES modules are processed correctly
          }]
        ],
        plugins: [
          '@babel/plugin-transform-runtime'
        ]
      })
      .end();

    // Ensure proper handling of modules
    config.resolve.modules
      .add('node_modules')
      .add(path.resolve(__dirname, 'src'));
  },

  devServer: {
    port: 8082,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('*.js', (req, res, next) => {
        res.type('application/javascript');
        next();
      });
      return middlewares;
    }
  }
});