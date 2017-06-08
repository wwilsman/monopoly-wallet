module.exports = {
  env: {
    es6: true,
    node: true
  },

  extends: [
    'eslint:recommended'
  ],

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true
    }
  },

  rules: {
    'indent': ['error', 2, { SwitchCase: 1 }],
    'semi': ['error', 'always']
  }
};
