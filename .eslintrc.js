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

  plugins: [
    'react'
  ],

  rules: {
    'indent': ['error', 2, { SwitchCase: 1, ignoredNodes: ['JSXElement *'] }],
    'no-console': 'warn',
    'no-extra-boolean-cast': 'off',
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 4],
    'semi': ['error', 'always']
  }
};
