require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debugRouter = require('debug')('dorbit-slackbot:router');
const handleRingEvent = require('./ring-event');
const handleSlackWebhook = require('./slack-webhooks');
const handleScrabbleCommand = require('./scrabble-command');
const config = require('../config');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  debugRouter("Received a request: " + req.method + " " + req.url);
  res.send('<h3>Dorbit is running! :D</h3>');
});

app.post('/ring', handleRingEvent);

app.post('/slack-ic', handleSlackWebhook);

app.post('/scrabblize', handleScrabbleCommand);

app.listen(config.port, () => {
  debugRouter(`App listening on port ${config.port}...`);
});
