const debugSlackHook = require('debug')('dorbit-slackbot:slack-hook');
const VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

const getDoorbellClaimedMessage = userId => {
  return userId ? `<@${userId}> is getting the door!` : 'Somebody got it, not sure who though...';
}

module.exports = (req, res) => {
  const { callback_id, user, token, original_message } = JSON.parse(req.body.payload);

  if (token !== VERIFICATION_TOKEN) {
    debugSlackHook("Token received does not match token from Slack");
    debugSlackHook(req.body);
    res.sendStatus(403);
    return;
  }

  if (callback_id === 'doorbell_claimed') {
    debugSlackHook('Doorbell claimed request from Slack');
    res.send({
      'text': getDoorbellClaimedMessage(user.id),
      'attachments': original_message.attachments.filter(attachment => attachment.callback_id !== 'doorbell_claimed')
    });
  } else {
    debugSlackHook('Request from Slack did not match callback id');
    res.sendStatus(200);
  }
}