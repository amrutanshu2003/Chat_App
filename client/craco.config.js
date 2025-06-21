const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "http": require.resolve("stream-http"),
          "https": require.resolve("https-browserify"),
          "util": require.resolve("util/"),
          "zlib": false,
          "stream": require.resolve("stream-browserify"),
          "url": require.resolve("url/"),
          "crypto": require.resolve("crypto-browserify"),
          "assert": require.resolve("assert/"),
          "buffer": require.resolve("buffer/"),
          "process": require.resolve("process"),
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process',
        }),
      ]
    }
  }
}; 