const axios = require('axios');
const { logger } = require('./logger');

axios.interceptors.request.use(
  (config) => {
    logger.info(
      `Outgoing Axios request: ${config.method.toUpperCase()} ${config.url}`,
    );
    logger.info('Request body:', config.data);
    return config;
  },
  (error) => Promise.reject(error),
);

axios.interceptors.response.use(
  (response) => {
    logger.info(`Axios response status: ${response.status}`);
    logger.info('Response data:', response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      logger.error(`Axios error status: ${error.response.status}`);
      logger.error('Error response data:', error.response.data);
    } else {
      logger.error('Axios error:', error.message);
    }
    return Promise.reject(error);
  },
);

module.exports = { axios };
