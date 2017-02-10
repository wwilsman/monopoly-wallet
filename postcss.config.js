module.exports = {
  plugins: [
    require('postcss-import'),
    require('autoprefixer'),
    require('postcss-nested'),
    require('postcss-custom-properties'),
    require('postcss-color-function'),
    require('postcss-calc')
  ]
}
