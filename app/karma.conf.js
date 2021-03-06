const path = require('path');

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    browsers: [config.headless ? 'ChromeHeadless' : 'Chrome'],

    reporters: [
      'mocha',
      'coverage',
      config.junit && 'junit'
    ].filter(Boolean),

    files: [
      { pattern: 'test/index.js', watched: false },
      { pattern: '../server/themes/classic/icons.svg', watched: false, included: false },
      { pattern: '../server/public/icons.svg', watched: false, included: false },
      { pattern: '../server/public/logo.png', watched: false, included: false }
    ],

    proxies: {
      '/icons/classic.svg': path.resolve('../server/themes/classic/icons.svg'),
      '/icons.svg': path.resolve('../server/public/icons.svg'),
      '/logo.png': path.resolve('../server/public/logo.png')
    },

    preprocessors: {
      'test/index.js': ['webpack']
    },

    coverageReporter: {
      type: config.coverage === false
        ? 'none' : (config.coverage || 'text-summary')
    },

    junitReporter: {
      outputDir: process.env.JUNIT_FILE || '',
      outputFile: 'test-results.xml',
      useBrowserName: false
    },

    webpack: require('./webpack.config'),

    webpackMiddleware: {
      stats: 'errors-only'
    },

    plugins: [
      'karma-chrome-launcher',
      'karma-coverage',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-junit-reporter',
      'karma-webpack'
    ]
  });
};
