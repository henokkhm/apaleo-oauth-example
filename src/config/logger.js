const winston = require('winston');

const {
  combine, timestamp, json, label,
} = winston.format;

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: '[LOGGER]' }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A', // 2022-01-25 03:23:10.350 PM
    }),
    json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'combined.log',
    }),
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error',
    }),
  ],
});

module.exports = {
  logger,
};

/**
 * Log levels:
 *
 * {
 *   error: 0,
 *   warn: 1,
 *   info: 2,
 *   http: 3,
 *   verbose: 4,
 *   debug: 5,
 *   silly: 6
 *   }
 */
