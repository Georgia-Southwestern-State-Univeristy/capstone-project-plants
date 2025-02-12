const path = require('path');

module.exports = {
  target: 'node', // ✅ Ensures Webpack builds for Node.js (backend)
  entry: './server/vueServer.js',
  output: {
    path: path.resolve(__dirname, 'dist-server'),
    filename: 'server.js'
  },
  externals: {
    ioredis: 'commonjs ioredis' // ✅ Prevent Webpack from bundling Redis
  },
  resolve: {
    fallback: {
      "fs": false,  // ✅ Prevents FS errors in frontend
      "net": false,
      "tls": false
    }
  }
};
