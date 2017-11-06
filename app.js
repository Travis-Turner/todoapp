const express = require('express');
// const {mongoose} = require('./db/mongoose');

var app = express();

app.get('/', (req, res) => {
  res.send('HELLO');
});

app.listen(3000, () => {
  'Server up!'
});
