const axios = require('axios');
const debugSlackApi = require('debug')('dorbit-slackbot:slack-api');
const errorSlackApi = require('debug')('dorbit-slackbot:slack-api-error');

const slack = axios.create({
  baseURL: process.env.SLACK_API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SLACK_ACCESS_TOKEN}`
  }
});

const dorcam = axios.create({
  baseURL: process.env.DORCAM_BASE_URL,
  timeout: 5000
})

const slackDoorbellMessages = JSON.parse(process.env.SLACK_DOORBELL_MESSAGES);

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

module.exports = (req, res) => {
  const { source_id, token } = req.body;

  if (token === process.env.SOURCE_TOKEN) {
    debugSlackApi("Event from source: " + source_id);
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
    }).catch(slackApiErrorHandler);
  } else {
    debugSlackApi("Token received in ring payload was invalid.");
    res.sendStatus(403);
  }
};