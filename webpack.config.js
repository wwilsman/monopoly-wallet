const webpack = require('webpack');
const path = require('path');

const autoprefixer = require('autoprefixer');
const precss = require('precss');

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
    noInfo: true
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
          'react-hot-loader/babel'
        ]
      }
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader'
      }, {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1
        }
      }, {
        loader: 'postcss-loader',
        options: {
          plugins() {
            return [precss, autoprefixer];
          }
        }
      }]
    }]
  }
};
