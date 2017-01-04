var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-hot-middleware/client',
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch',
    './app/index'
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.bundle.js',
    publicPath: '/public/',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      include: path.join(__dirname, 'app'),
      exclude: /node_modules/,
      query: {
        cacheDirectory: true,
        plugins: ['react-hot-loader/babel'],
        presets: [
          ['es2015', { modules: false }],
          'stage-0',
          'react'
        ]
      }
    },{
      test: /\.scss$/,
      loaders: [
        'style-loader',
        'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]',
        'postcss-loader'
      ]
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],
  resolve: {
    alias: {
      // Animated library needs update
      'react/lib/CSSPropertyOperations': 'react-dom/lib/CSSPropertyOperations'
    }
  }
};
