const path = require('path');
const webpack = require('webpack');

function resolve(...args) {
  return path.resolve(__dirname, ...args);
}

const config = {
  entry: {
    'browser-env': resolve('browser-env.js'),
  },
  output: {
    path: resolve('.'),
    filename: 'browser-test-build.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          resolve('../src'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            /*plugins: [
              require('transform-runtime'),
              require('transform-class-properties'),
            ],*/
          },
        },
      },
    ],
  },
};

module.exports = config;
