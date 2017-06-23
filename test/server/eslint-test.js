import lint from 'mocha-eslint';

lint([
  'server/**/*.js',
  'test/server/**/*.js'
]);
