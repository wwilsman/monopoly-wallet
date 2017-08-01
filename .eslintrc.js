module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },

  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],

  parser: 'babel-eslint',

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      experimentalObjectRestSpread: true,
      jsx: true
    }
  },

  plugins: [
    'react'
  ],

  rules: {
    'indent': ['error', 2, { SwitchCase: 1 }],
    'no-console': 'warn',
    'no-extra-boolean-cast': 'off',
    'semi': ['error', 'always']
  }
};
