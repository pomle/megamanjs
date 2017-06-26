const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function resolve(...args) {
  return path.resolve(__dirname, ...args);
}

const config = {
  entry: resolve('src', 'engine.js'),
  output: {
    path: resolve('dist'),
    filename: 'engine.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          resolve('src'),
        ],
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
        from: resolve('src', 'megaman2.js'),
      },
      {
        from: resolve('src', 'megaman2.css'),
      },
      {
        from: resolve('src', 'resource'),
        to: resolve('dist', 'resource'),
      },
    ]),
  ],
};

if (process.env.NODE_ENV === 'production') {
  const plugins = [
    new webpack.optimize.UglifyJsPlugin(),
  ];

  config.plugins.push(...plugins);
}

module.exports = config;
