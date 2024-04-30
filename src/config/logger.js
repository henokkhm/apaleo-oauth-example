const { createLogger, format, transports } = require('winston');

const { combine, timestamp, prettyPrint, errors } = format;

const logger = createLogger({
  level: 'verbose',
  format: combine(errors({ stack: true }), timestamp(), prettyPrint()),
  transports: [new transports.Console()],
});

module.exports = {
  logger,
};
