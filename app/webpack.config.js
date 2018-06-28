const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const HTMLWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const htmlWebpackPlugin = new HTMLWebpackPlugin({
  title: 'Monopoly Wallet',
  inject: false,
  template: require('html-webpack-template'),
  appMountId: 'react-root',
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

const cssLoaders = [{
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
}];

module.exports = {
  mode: env({
    development: 'development',
    production: 'production'
  }),

  stats: {
    assets: true,
    children: false
  },

  devtool: env({
    development: 'inline-source-map'
  }),

  entry: env({
    development: [
      '@babel/polyfill',
      'react-hot-loader/patch',
      'webpack-hot-middleware/client',
      'app/src/index.js'
    ],
    production: [
      '@babel/polyfill',
      'app/src/index.js'
    ]
  }),

  output: {
    filename: 'bundle-[hash].js',
    path: path.resolve('./dist'),
    publicPath: '/'
  },

  plugins: env({
    production: [
      new webpack.DefinePlugin({ NODE_ENV: 'production' }),
      new UglifyJsPlugin(),
      new MiniCssExtractPlugin({ filename: 'styles.css' }),
      htmlWebpackPlugin,
      faviconsWebpackPlugin
    ],
    development: [
      new webpack.DefinePlugin({ NODE_ENV: 'development' }),
      htmlWebpackPlugin,
      faviconsWebpackPlugin,
      new HTMLWebpackHarddiskPlugin(),
      new webpack.HotModuleReplacementPlugin()
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
            '@babel/preset-env',
            ['@babel/preset-stage-2', {
              decoratorsLegacy: true
            }],
            '@babel/preset-react'
          ],
          plugins: env({
            development: ['react-hot-loader/babel']
          })
        }
      }],
      production: [{
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader].concat(cssLoaders)
      }],
      development: [{
        test: /\.css$/,
        use: ['style-loader'].concat(cssLoaders)
      }],
      test: [{
        test: /\.css$/,
        use: ['style-loader'].concat(cssLoaders)
      }, {
        test: /\.yml/,
        use: ['js-yaml-loader']
      }]
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
