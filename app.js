const express = require('express');
const {port} = require('./config');
// const {mongoose} = require('./db/mongoose');

var app = express();

app.get('/', (req, res) => {
  res.send('HELLO');
});

app.listen(port, () => {
  'Server up!'
});
