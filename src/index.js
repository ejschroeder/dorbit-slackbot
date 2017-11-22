require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debug = require('debug')('dorbit-slackbot:index');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  debug("Received a request: " + req.method + " " + req.url);
  res.send('<h3>Dorbit is running! :D</h3>');
});

app.post('/ring', (req, res) => {
  const { source_id, token } = req.body;

  if (token === process.env.SOURCE_TOKEN) {
    debug("Event from source: " + source_id);
    res.sendStatus(200);
  } else {
    debug("Token received in ring payload was invalid.");
    res.sendStatus(500);
  }
});

app.post('/slackhook', (req, res) => {
  
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}...`);
});