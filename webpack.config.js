const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const HTMLWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
  logo: './public/logo.png',
  background: '#033343',
  icons: {
    appleIcon: true,
    appleStartup: { offset: 20 }
  }
});

const cssLoaders = [
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
];

module.exports = {
  stats: {
    assets: true,
    children: false
  },

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
    path: path.resolve(__dirname, 'dist/public'),
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
    base: [
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development'
      })
    ],
    production: [
      new ExtractTextPlugin('styles.css'),
      htmlWebpackPlugin,
      faviconsWebpackPlugin
    ],
    development: [
      htmlWebpackPlugin,
      faviconsWebpackPlugin,
      new HTMLWebpackHarddiskPlugin(),
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
      base: [{
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
      }],
      production: [{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: cssLoaders
        })
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
