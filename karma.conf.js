const path = require('path');
const webpackConfig = require('./webpack.config');

delete webpackConfig.entry;
delete webpackConfig.devServer.hot;

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

    webpackMiddleware: webpackConfig.devServer,

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
