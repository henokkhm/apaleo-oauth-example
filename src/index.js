const path = require ('path');
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

app.get('/apaleo-auth', (req, res) => {
  // retrive the authorization code from the query string
  //
  return res.render('index', { title: 'Apaleo OAuth Example' });
});

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});