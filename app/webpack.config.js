const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const htmlWebpackPlugin = new HTMLWebpackPlugin({
  title: 'Monopoly Wallet',
  inject: false,
  template: require('html-webpack-template'),
  appMountId: 'root',
  hash: true,
  meta: [{
    name: 'viewport',
    content: 'width=device-width,maximum-scale=1'
  }]
});

const faviconsWebpackPlugin = new FaviconsWebpackPlugin({
  title: 'Monopoly Wallet',
  logo: path.resolve('../server/public/logo.png'),
  background: '#033343',
  icons: {
    appleIcon: true,
    appleStartup: { offset: 20 }
  }
});

module.exports = {
  mode: env({
    development: 'development',
    production: 'production',
    testing: 'none'
  }),

  stats: {
    assets: true,
    children: false
  },

  devtool: env({
    development: 'eval-source-map',
    testing: 'eval-source-map'
  }),

  entry: [
    '@babel/polyfill',
    env({ development: 'react-hot-loader/patch' }),
    env({ development: 'webpack-hot-middleware/client' }),
    'app/src/index.js'
  ].filter(Boolean),

  output: {
    filename: 'bundle-[hash].js',
    path: path.resolve('./dist'),
    publicPath: '/'
  },

  plugins: env({
    base: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        )
      }),
    ],
    production: [
      new MiniCssExtractPlugin({ filename: 'styles.css' }),
      htmlWebpackPlugin,
      faviconsWebpackPlugin
    ],
    development: [
      new webpack.HotModuleReplacementPlugin(),
      htmlWebpackPlugin,
      faviconsWebpackPlugin
    ]
  }),

  module: {
    rules: env({
      base: [{
        test: /\.js$/,
        exclude: /node_modules(?!\/server)/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['@babel/env', { targets: { browsers: 'last 1 version' }}],
            '@babel/react'
          ],
          plugins: env({
            base: [
              ['@babel/proposal-decorators', { legacy: true }],
              ['@babel/proposal-class-properties', { loose: true }]
            ],
            development: ['react-hot-loader/babel']
          })
        }
      }, {
        test: /\.css$/,
        use: [env({
          production: MiniCssExtractPlugin.loader,
          development: { loader: 'style-loader', options: { sourceMap: true, hmr: true } },
          testing: { loader: 'style-loader', options: { sourceMap: true } }
        }), {
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
            sourceMap: true,
            plugins: [
              require('postcss-import'),
              require('precss'),
              require('autoprefixer'),
              require('postcss-color-mod-function')
            ]
          }
        }]
      }],
      testing: [{
        test: /\.yml/,
        use: ['js-yaml-loader']
      }]
    })
  },

  resolve: {
    alias: env({
      development: {
        'react-dom': '@hot-loader/react-dom'
      }
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
}
