const webpack = require('webpack');
const path = require('path');
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  outputDir: 'dist',
  configureWebpack: {
    resolve: {
      // Extensions should be at the resolve level, not inside fallback
      extensions: ['.js', '.vue', '.json'],
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert/"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify/browser"),
        "url": require.resolve("url/"),
        "buffer": require.resolve("buffer/"),
        "util": require.resolve("util/"),
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "dns": false,
        "process": require.resolve("process/browser"),
        "querystring": require.resolve("querystring-es3"),
        "child_process": false,
        "vm": require.resolve("vm-browserify")
      },
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    // Plugins should be at the configureWebpack level, not inside resolve
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env)
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  },

  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        args[0]['process.env'] = JSON.stringify(process.env);
        args[0]['process.browser'] = true;
        args[0]['process.version'] = JSON.stringify(process.version);
        return args;
      });
    
    config
      .plugin('provide')
      .use(webpack.ProvidePlugin, [{
        process: 'process/browser'
      }]);

    config.module
      .rule('js')
      .test(/\.js$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end();
  },

  devServer: {
    port: 8082,
    hot: true,
    open: true,
    historyApiFallback: {
      disableDotRule: true,
      index: '/index.html'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.get('*.js', (req, res, next) => {
        res.set('Content-Type', 'application/javascript');
        next();
      });
      return middlewares;
    }
  }
});