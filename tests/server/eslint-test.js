import lint from 'mocha-eslint';

lint([
  'server/**/*.js',
  'tests/server/**/*.js'
]);
