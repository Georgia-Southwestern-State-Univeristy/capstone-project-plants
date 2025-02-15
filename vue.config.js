import webpack from 'webpack';
import path from 'path';
import { defineConfig } from '@vue/cli-service';
// import { mergeAlias } from 'vite';
// import { dot } from '@tensorflow/tfjs';
// // import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
// // import { fileURLToPath } from 'url';
// // const NodePolyfillPlugin = (await import('node-polyfill-webpack-plugin')).default;
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

export default defineConfig({
  outputDir: 'dist',
  configureWebpack: {
    entry: './src/main.js',
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: '/',
      // libraryTarget: 'module', // ✅ Forces ES Module output
      // environment: { module: true } // ✅ Ensures Webpack 5 keeps `import`
    },
    // experiments: {
    //   outputModule: true, // ✅ Enable native ESM output
    // },
    target: 'web', // ✅ Ensure Webpack knows this is a browser build
    externals: [
      (context, request, callback) => {
        if (/dotenv|server/.test(request)) {
          return callback(null, 'commonjs ' + request); // ✅ Fully exclude dotenv and server/
        }
        callback();
      },
      {
        "dotenv": "commonjs dotenv",
        "url": "commonjs url",
        "fs": "commonjs fs",
        "path": "commonjs path",
        "firebase-admin": "commonjs firebase-admin",
        "express": "commonjs express",
        "on-finished": "commonjs on-finished",
        "raw-body": "commonjs raw-body"
      }
    ],
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      fallback: {
        "events": "events/",  // ✅ Fix `node:events`
        "stream": "stream-browserify",  // ✅ Fix `node:stream`
        "util": "util/",  // ✅ Fix `node:util`
        "buffer": "buffer/",
        "process": "process/browser",
        "crypto": "crypto-browserify",
        "assert": "assert/",
        "http": "stream-http",
        "https": "https-browserify",
        "os": "os-browserify/browser",
        "url": "url/",
        "path": "path-browserify",
        "querystring": "querystring-es3",
        "vm": "vm-browserify",
        "stream": "stream-browserify",
        "crypto": false,
        "fs": false,  // ❌ Prevents server-side modules from breaking frontend
        "net": false,
        "tls": false,
        "zlib": false,
        "child_process": false,
        "async_hooks": false, // Prevents Webpack from bundling `async_hooks`
        "dotenv": false
      },
      alias: {
        'google-auth-library': false,
        'gcp-metadata': false,
        'google-logging-utils': false,
        'firebase-admin': false,
        'dns': false, // Prevents Webpack from bundling `dns`
        'ioredis': false, // Prevents Webpack from bundling Redis in frontend
        'fs': false, // Prevents backend-only modules from breaking frontend
        'path': false,
        'net': false,
        'tls': false
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']

      }),
      // new NodePolyfillPlugin() // ✅ Fix for handling node modules in the browser
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
            modules: false // ✅ Ensures ES modules are processed correctly
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
      .add(path.resolve(process.cwd(), 'src'));
  },

  devServer: {
    port: 8082,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(process.cwd(), 'dist'),
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
