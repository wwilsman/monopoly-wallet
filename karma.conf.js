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
      { pattern: 'test/app/acceptance/index.js', watched: false }
    ],

    preprocessors: {
      'test/app/acceptance/index.js': ['webpack']
    },

    webpack: Object.assign(webpackConfig, {
      module: {
        rules: webpackConfig.module.rules.concat([
          {
            test: /\.yml/,
            use: ['json-loader', 'yaml-loader']
          }
        ])
      },
      resolve: {
        alias: {
          'mock-socket': 'mock-socket/src',
          'socket.io-client': 'mock-socket/socket-io'
        }
      }
    }),

    webpackMiddleware: {
      stats: 'errors-only'
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ]
  });
};
