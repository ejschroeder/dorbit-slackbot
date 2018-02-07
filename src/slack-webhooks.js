const debugSlackHook = require('debug')('dorbit-slackbot:slack-hook');
const VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

module.exports = (req, res) => {
  const { callback_id, user, token } = JSON.parse(req.body.payload);

  if (token !== VERIFICATION_TOKEN) {
    debugSlackHook("Token received does not match token from Slack");
    debugSlackHook(req.body);
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
}