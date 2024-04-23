const path = require('path');
const express = require('express');
require('dotenv').config();

const { axios } = require('./config/axiosInstance');
const { logger } = require('./config/logger');
const { morganMiddleware } = require('./middlewares/morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(morganMiddleware);

app.get('/', (req, res) => {
  return res.render('index', { title: 'Apaleo OAuth Example' });
});

// The following route accepts the authorization code from Apaleo
app.get('/auth/apaleo/redirect', (req, res) => {
  const queryParams = req.query;
  return res.render('auth-apaleo-redirect', {
    title: 'Data Returned From Apaleo',
    queryParams,
  });
});

// The following route accepts the authorization code from the 
// front-end (to mimic a SPA), and sends it to Apaleo in order to 
// exchange it for an access token, refresh token, and user profile info
// If successful, it redirects the user to the dashboard
app.get('/auth/apaleo/token-exchange-handler', (req, res) => {
  logger.info('Query String Parameters:', req.query);
  logger.info('JSON Request Body:', req.body);

  try {
  
  } catch(e) {
    logger.error(`Error while exchanging auth-code for access token`)
  };
});

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});
