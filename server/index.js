const path = require('path');
const { MongoClient } = require('mongodb');

const ENV = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/monopoly-wallet',
    options: { useNewUrlParser: true }
  }
};

// setup webpack dev middleware
if (ENV.env === 'development') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');

  const app = require('./src').default;
  const compiler = webpack(require('app/webpack.config'));
  const middle = webpackDevMiddleware(compiler, {
    contentBase: path.resolve('./public'),
    publicPath: '/',
    stats: 'minimal'
  });

  app.use(middle);
  app.use(webpackHotMiddleware(compiler));
  app.use(/\/[^.]*$/, middle);

  // setup mongodb
  MongoClient
    .connect(ENV.mongodb.uri, ENV.mongodb.options)
    .then(app.setup)
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log('Unable to connect to mongodb: %s', err.name);
      // console.error(err);
    });

  // start the server
  app.start(ENV.host, ENV.port);

// use built assets
} else {
  const app = require('./dist').default;
  app.serve(path.resolve('../app/dist'));

  app.use(/\/[^.]*$/, (req, res) => {
    res.sendFile(path.resolve('../app/dist/index.html'));
  });

  // setup mongodb and start the server
  MongoClient.connect(ENV.mongodb.uri, ENV.mongodb.options).then(app.setup);
  app.start(ENV.host, ENV.port);
}
