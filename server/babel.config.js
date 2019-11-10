module.exports = ({ env }) => ({
  presets: [
    ["@babel/env", {
      targets: { node: true }
    }]
  ],
  plugins: [
    "@babel/proposal-class-properties",
    "@babel/proposal-optional-chaining",
    "@babel/proposal-nullish-coalescing-operator",
    env('test') && 'istanbul'
  ].filter(Boolean)
});
