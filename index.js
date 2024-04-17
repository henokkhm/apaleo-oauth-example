const express = require('express');
require('dotenv').config();

const { logger } = require('./src/config/logger');

const PORT = process.env.PORT || 4000;

const app = express();

app.get('/', (req, res) => res.send('Hello World !'));

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});