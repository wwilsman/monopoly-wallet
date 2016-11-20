var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: './app/index',
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'app.bundle.js',
    publicPath: '/public/',
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: { cacheDirectory: true }
    }],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  }
};
