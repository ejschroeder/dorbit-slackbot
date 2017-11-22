require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debug = require('debug')('dorbit-slackbot:index');
const debugSlackHook = require('debug')('dorbit-slackbot:slack-web-hook');

const app = express();
const slack = axios.create({
	baseURL: process.env.SLACK_HOOK,
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json'
	}
});
const slackDoorbellMessages = JSON.parse(process.env.SLACK_HOOK_DOORBELL_MESSAGES);

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
    let messageIndex = Math.floor(Math.random() * slackDoorbellMessages.length);
    slack.post(process.env.SLACK_HOOK_DOORBELL, { 'text': slackDoorbellMessages[messageIndex] })
	 .then((response) => { debugSlackHook('Slack message sent!'); })
	 .catch(slackWebhookErrorHandle);
  } else {
    debug("Token received in ring payload was invalid.");
    res.sendStatus(500);
  }
});

app.post('/slackhook', (req, res) => {
  
});

function slackWebhookErrorHandle(error) {
  if (error.response) {
	debugSlackHook(error.response.data);
	debugSlackHook(error.response.status);
	debugSlackHook(error.response.headers);
  } else if (error.request) {
	debugSlackHook(error.request);
  } else {
	debugSlackHook('Error ' + error.message);
  }
  console.log(error.config);
}


app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}...`);
});
