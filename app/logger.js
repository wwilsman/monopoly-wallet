/* eslint no-console: "off" */

let logger = {
  log: () => {},
  error: () => {}
};

if (process.env.NODE_ENV === 'development') {
  logger.log = console.log.bind(console);
  logger.error = console.error.bind(console);
}

export default logger;
