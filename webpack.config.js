const webpack = require('webpack');
const path = require('path');

const environment = process.env.NODE_ENV || 'development';
const env = (conf) => conf[environment];

module.exports = {
  devtool: env({
    development: 'inline-source-map'
  }),

  entry: env({
    development: [
      'babel-polyfill',
      'react-hot-loader/patch',
      'webpack-hot-middleware/client',
      './app/index.js'
    ],
    production: [
      'babel-polyfill',
      './app/index.js'
    ]
  }),

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/'
  },

  devServer: env({
    development: {
      hot: true,
      contentBase: path.join(__dirname, 'public'),
      publicPath: '/',
      stats: 'minimal'
    }
  }),

  plugins: env({
    development: [
      new webpack.HotModuleReplacementPlugin()
    ]
  }),

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
        plugins: env({
          development: [
            'react-hot-loader/babel',
            'transform-decorators-legacy'
          ],
          production: [
            'transform-decorators-legacy'
          ]
        })
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
