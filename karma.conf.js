const path = require('path');
const webpackConfig = require('./webpack.config');

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    reporters: ['mocha'],
    singleRun: true,

    browsers: ['Chrome'],

    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      { pattern: 'test/app/**/*-test.js', watched: false }
    ],

    preprocessors: {
      'test/app/**/*-test.js': ['webpack']
    },

    webpack: Object.assign({}, webpackConfig, {
      entry: null,

      // help loading our "fixtures"
      module: {
        rules: webpackConfig.module.rules.concat([{
          test: /\.yml/,
          use: ['json-loader', 'yaml-loader']
        }])
      },
      // mock socket.io via aliasing
      resolve: {
        alias: {
          'mock-socket': 'mock-socket/src',
          'socket.io-client': 'mock-socket/socket-io'
        }
      },
      // enzyme externals
      externals: {
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      }
    }),

    webpackMiddleware: Object.assign({}, webpackConfig.devServer, {
      hot: false
    }),

    mochaReporter: {
      showDiff: true
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ]
  });
};
