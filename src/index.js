require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debugRouter = require('debug')('dorbit-slackbot:router');
const handleRingEvent = require('./ring-event');
const handleSlackWebhook = require('./slack-webhooks.js');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  debugRouter("Received a request: " + req.method + " " + req.url);
  res.send('<h3>Dorbit is running! :D</h3>');
});

app.post('/ring', handleRingEvent);

app.post('/slack-ic', handleSlackWebhook);

app.listen(process.env.SLACKBOT_PORT, () => {
  debugRouter(`App listening on port ${process.env.SLACKBOT_PORT}...`);
});
