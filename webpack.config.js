const webpack = require('webpack');
const path = require('path');

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

  resolve: {
    alias: env({
      test: {
        'mock-socket': 'mock-socket/src',
        'socket.io-client': 'mock-socket/socket-io'
      }
    })
  },

  module: {
    rules: env({
      base: [
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader'
        },
        {
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
              base: ['transform-decorators-legacy'],
              development: ['react-hot-loader/babel']
            })
          }
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'style-loader'
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: true,
                importLoaders: 2,
                localIdentName: '[name]__[local]--[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins() {
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }
          ]
        }
      ],
      test: [
        {
          test: /\.yml/,
          use: ['js-yaml-loader']
        }
      ]
    })
  }
};

/**
 * Intelligently chooses some configuration based on the current Node
 * environment. All values can optionally be extended from a provided
 * base configuration.
 *
 * @param {Object} configs - hash of environment specific configurations
 * @param {Mixed} [configs.base] - base configuration to extend from
 * @param {Mixed} [configs.development] - "development" only configuration
 * @param {Mixed} [configs.production] - "production" only configuration
 * @param {Mixed} [configs.test] - "test" only configuration
 * @returns {Object} the value of the configuration for a specific
 * environment; maybe merged with `configs.base`
 */
function env(configs) {
  let conf = configs[process.env.NODE_ENV || 'development'];

  if (configs.base) {
    if (Array.isArray(configs.base) && Array.isArray(conf)) {
      conf = configs.base.concat(conf);
    } else if (typeof configs.base === 'object' && typeof conf === 'object') {
      conf = Object.assign({}, configs.base, conf);
    } else {
      conf = conf || configs.base;
    }
  }

  return conf;
};
