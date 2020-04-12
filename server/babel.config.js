module.exports = ({ env }) => ({
  presets: [
    ["@babel/env", {
      targets: { node: true }
    }]
  ],
  plugins: [
    "@babel/proposal-class-properties",
    env('test') && 'istanbul'
  ].filter(Boolean)
});
