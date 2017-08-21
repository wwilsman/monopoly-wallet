module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    reporters: ['mocha'],

    browsers: ['Chrome'],

    files: [
      { pattern: 'test/app/acceptance/index.js', watched: false },
      { pattern: 'server/themes/classic/icons.svg', watched: false, included: false },
      { pattern: 'public/logo.png', watched: false, included: false }
    ],

    proxies: {
      '/icons/classic.svg': '/base/server/themes/classic/icons.svg',
      '/logo.png': '/base/public/logo.png'
    },

    preprocessors: {
      'test/app/acceptance/index.js': ['webpack']
    },

    webpack: require('./webpack.config'),

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
