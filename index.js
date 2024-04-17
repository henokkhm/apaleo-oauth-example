const express = require('express');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const app = express();

app.get('/', (req, res) => res.send('Hello World !'));

app.listen(PORT, () => console.log(`App listening to port ${PORT}`));
