const webpack = require('webpack');
const path = require('path');

module.exports = {
  devtool: 'inline-source-map',

  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    'webpack-hot-middleware/client',
    'webpack/hot/only-dev-server',
    './app/index.js'
  ],

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  },

  devServer: {
    hot: true,
    contentBase: path.join(__dirname, 'public'),
    publicPath: '/',
    stats: 'errors-only'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        babelrc: false,
        presets: [
          ['env', { modules: false }],
          'stage-2',
          'react'
        ],
        plugins: [
          'react-hot-loader/babel',
          'transform-decorators-legacy'
        ]
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          modules: true,
          sourceMap: true,
          importLoaders: 2,
          localIdentName: '[name]__[local]--[hash:base64:5]'
        }
      }, {
        loader: 'postcss-loader',
        options: {
          plugins() {
            return [
              require('precss'),
              require('autoprefixer')
            ];
          }
        }
      }]
    }]
  }
};
