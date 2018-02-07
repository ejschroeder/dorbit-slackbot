const debugSlackHook = require('debug')('dorbit-slackbot:scrabble-command');

module.exports = (req, res) => {
  const body = JSON.parse(req.body);

  debugSlackHook(body);
  res.sendStatus(200);
}