require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const debug = require('debug')('dorbit-slackbot:index');
const debugSlackApi = require('debug')('dorbit-slackbot:slack-api');
const debugSlackHook = require('debug')('dorbit-slackbot:slack-hook');

const app = express();
const slack = axios.create({
	baseURL: process.env.SLACK_API_BASE_URL,
	timeout: 5000,
	headers: {
		'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SLACK_ACCESS_TOKEN}`
	}
});
const slackDoorbellMessages = JSON.parse(process.env.SLACK_DOORBELL_MESSAGES);

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

    slack.post(process.env.SLACK_POST_MESSAGE_ENDPOINT, { 
      'channel': 'C85CMN4AK',
      'icon_emoji': ':door:',
      'attachments': [
        {
          'fallback': 'Somebody is at the door!',
          "mrkdwn_in": ["text"],
          'attachment_type': 'default',
          'callback_id': 'doorbell_claimed',
          'color': 'warning',
          'text': `*${slackDoorbellMessages[messageIndex]}*`,
          'actions': [
            {
              'name': 'claimed',
              'style': 'primary',
              'type': 'button',
              'text': 'I got it!',
              'value': 1
            }
          ]
        }
      ]
    }).then((response) => { 
      debugSlackApi('Slack request made!'); 
      if (!response.data.ok) {
        debugSlackApi('Slack responded with an error: ' + response.data.error);
      }
    }).catch(slackWebhookErrorHandle);
  } else {
    debug("Token received in ring payload was invalid.");
    res.sendStatus(403);
  }
});

app.post('/slack-ic', (req, res) => {
  const { callback_id, user, token } = req.body;

  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    debugSlackHook("Token received does not match token from Slack");
    res.sendStatus(403);
    return;
  }

  if (callback_id === 'doorbell_claimed' && user.name) {
    debugSlackHook('Doorbell claimed request from Slack');
    res.send({
      'text': `${user.name} is getting the door!`
    });
  } else {
    debugSlackHook('Request from Slack did not match callback id');
    res.sendStatus(200);
  }
});

function slackWebhookErrorHandle(error) {
  if (error.response) {
    debugSlackApi(error.response.data);
    debugSlackApi(error.response.status);
    debugSlackApi(error.response.headers);
  } else if (error.request) {
	  debugSlackApi(error.request);
  } else {
	  ebugSlackHook('Error ' + error.message);
  }
  console.log(error.config);
}

app.listen(process.env.SLACKBOT_PORT, () => {
  console.log(`App listening on port ${process.env.SLACKBOT_PORT}...`);
});
