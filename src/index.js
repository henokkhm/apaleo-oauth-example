const express = require('express');
require('dotenv').config();

const { axios } = require('./config/axiosInstance');
const { logger } = require('./config/logger');
const { morganMiddleware } = require('./middlewares/morgan');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(morganMiddleware);

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/todos',
    );

    const todos = response.data
      .slice(0, 10)
      .map((todo) => `<li>${todo.title}</li>`)
      .join('');

    return res.send(`Hello there! Your to-do list:<br/><br/>${todos}`);
  } catch (err) {
    logger.error(`Error fetching data from jsonplaceholder: Error: ${err}`);
    return res.status(500).send('Internal server error');
  }
});

app.listen(PORT, () => {
  logger.info(`Example app listening on port ${PORT}`);
});