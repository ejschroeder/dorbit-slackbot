const axios = require('axios');
const debugSlackApi = require('debug')('dorbit-slackbot:slack-api');
const errorSlackApi = require('debug')('dorbit-slackbot:slack-api-error');
const config = require('../config');

const SLACK_ACCESS_TOKEN = process.env.SLACK_ACCESS_TOKEN;
const SOURCE_TOKEN = process.env.SOURCE_TOKEN;
const DOMAIN = process.env.DOMAIN;

const slack = axios.create({
  baseURL: config.slackApi.baseUrl,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SLACK_ACCESS_TOKEN}`
  }
});

const dorcam = axios.create({
  baseURL: config.cameraApi.baseUrl,
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
});

function slackApiErrorHandler(error) {
  if (error.response) {
    errorSlackApi(error.response.data);
    errorSlackApi(error.response.status);
    errorSlackApi(error.response.headers);
  } else if (error.request) {
	  errorSlackApi(error.request);
  } else {
	  errorSlackHook('Error ' + error.message);
  }
}

function getRandomNotificationMessage() {
  if (!config.notificationMessages || config.notificationMessages.length === 0) {
    return 'Somebody is at the door!';
  }
  let messageIndex = Math.floor(Math.random() * config.notificationMessages.length);
  return config.notificationMessages[messageIndex];
}

function postSlackMessage(imagePath) {
  let payload = {
    'channel': config.channelId,
    'icon_emoji': ':door:',
    'attachments': [
      {
        'fallback': 'Somebody is at the door!',
        "mrkdwn_in": ["text"],
        'attachment_type': 'default',
        'callback_id': 'doorbell_claimed',
        'color': 'warning',
        'text': `*${getRandomNotificationMessage()}*`,
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
  }

  if (imagePath) {
    debugSlackApi(`Built image url: https://${DOMAIN}${imagePath}`);
    payload['attachments'].push({
      "fallback": "Here's a picture I took of the door:",
      "color": "#36a64f",
      "text": "Here's a picture I took of the door:",
      "image_url": `https://${DOMAIN}${imagePath}`
    });
  }

  return slack.post(config.slackApi.postMessageEndpoint, payload);
}

module.exports = (req, res) => {
  const { source_id, token } = req.body;

  if (token === SOURCE_TOKEN) {
    debugSlackApi("Event from source: " + source_id);
    res.sendStatus(200);

    if (!config.channelId) {
      debugSlackApi('No channel id provided in environment'); 
      res.send(500);
      return;
    }

    dorcam.get(config.cameraApi.getPhotoEndpoint)
    .then((response) => {
      return postSlackMessage(response.data.path);
    })
    .catch((error) => {
      return postSlackMessage();
    })
    .then((response) => { 
      debugSlackApi('Slack request made!'); 
      if (!response.data.ok) {
        debugSlackApi('Slack responded with an error: ' + response.data.error);
      }
    })
    .catch(slackApiErrorHandler);
    
  } else {
    debugSlackApi("Token received in ring payload was invalid.");
    res.sendStatus(403);
  }
};
