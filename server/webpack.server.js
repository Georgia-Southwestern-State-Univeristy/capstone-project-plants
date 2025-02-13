import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: 'node', // ✅ Ensures Webpack builds for Node.js (backend)
  entry: path.resolve(__dirname, './vueServer.js'),
  output: {
    path: path.resolve(__dirname, '../dist-server'),
    filename: 'server.js'
  },
  externals: {
    ioredis: 'commonjs ioredis' // ✅ Prevents Webpack from bundling Redis
  },
  resolve: {
    fallback: {
      "fs": false,  // ✅ Prevents FS errors in frontend
      "net": false,
      "tls": false
    }
  }
};
