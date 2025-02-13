import webpack from 'webpack';
import path from 'path';
import { defineConfig } from '@vue/cli-service';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
// import { fileURLToPath } from 'url';
// const NodePolyfillPlugin = (await import('node-polyfill-webpack-plugin')).default;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

export default defineConfig({
  outputDir: 'dist',
  configureWebpack: {
    entry: './src/main.js',
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      publicPath: '/'
    },
    target: 'node', // ✅ Ensure Webpack knows this is a browser build
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
        "fs": false,  // ❌ Prevents server-side modules from breaking frontend
        "path": "path-browserify",
        "querystring": "querystring-es3",
        "net": false,
        "tls": false,
        "zlib": false,
        "child_process": false 
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer']

      }),
      new NodePolyfillPlugin() // ✅ Fix for handling node modules in the browser
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
