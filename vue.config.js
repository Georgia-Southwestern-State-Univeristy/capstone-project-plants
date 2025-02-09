const webpack = require('webpack')
const path = require('path')

module.exports = {
  outputDir: 'dist',
  configureWebpack: {
    resolve: {
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
        "vm": require.resolve("vm-browserify"),
        extensions: ['.js', '.vue', '.json']
      },
      alias: {
        '@': path.resolve(__dirname, 'src')
    },
    
  }, 
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  
},

  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        args[0]['process.env'] = JSON.stringify(process.env)
        args[0]['process.browser'] = true
        args[0]['process.version'] = JSON.stringify(process.version)
        return args
      })
    
    config
      .plugin('provide')
      .use(webpack.ProvidePlugin, [{
        process: 'process/browser'
      }])
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
  }
}

}

