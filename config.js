var config = {};

config.env    = process.env.NODE_ENV || 'development';
config.port   = process.env.PORT || 8080,
config.host   = process.env.HOSTNAME || 'localhost';
config.uri    = 'http://' + config.host + ':' + config.port;
config.secret = process.env.SESSION_SECRET || 'monopoly';

config.mongo = {
  uri: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/monopoly-wallet',
};

config.sendgrid = {
  user: process.env.SENDGRID_USERNAME,
  key: process.env.SENDGRID_PASSWORD,
};

module.exports = config;
