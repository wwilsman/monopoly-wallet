var config = {};

config.env    = process.env.NODE_ENV || 'development';
config.port   = process.env.PORT || 8080,
config.uri    = process.env.BASE_URI || 'http://localhost:' + config.port;
config.secret = process.env.SESSION_SECRET || 'monopoly';

config.mongo = {
  uri: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/mnplymngr',
};

config.sendgrid = {
  user: process.env.SENDGRID_USERNAME,
  key: process.env.SENDGRID_PASSWORD,
};

module.exports = config;
