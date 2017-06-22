const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve(...args) {
  return path.resolve(__dirname, ...args);
}

module.exports = {
  entry: resolve('src', 'main.js'),
  output: {
    path: resolve('dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          },
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: resolve('src', 'index.html'),
      },
      {
        from: resolve('src', 'main.css'),
      },
      {
        from: resolve('src', 'resource'),
        to: resolve('dist', 'resource'),
      },
    ]),
    //new webpack.optimize.UglifyJsPlugin(),
  ],
};
