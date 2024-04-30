const axios = require('axios');
const { logger } = require('./logger');

axios.interceptors.request.use(
  (config) => {
    logger.info(
      `Outgoing Axios request: ${config.method.toUpperCase()} ${config.url}`,
    );
    logger.info(`Request body: ${JSON.stringify(config.data)}`);
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => {
    logger.info(`Axios response status: ${JSON.stringify(response.status)}`);
    logger.info(`Axios response data: ${JSON.stringify(response.data)}`);
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`Axios error status: ${JSON.stringify(error.response.status)}`);
      logger.error(`Axios error response data: ${JSON.stringify(error.response.data)}`, );
    } else {
      logger.error(`Unknown Axios error: ${error.message}`);
    }
    return Promise.reject(error);
  },
);

module.exports = { axios };
