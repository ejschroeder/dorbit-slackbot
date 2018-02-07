const debugSlackHook = require('debug')('dorbit-slackbot:scrabble-command');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN;

module.exports = (req, res) => {
  const { token, text } = JSON.parse(req.body);

  if (token !== VERIFICATION_TOKEN) {
    debugSlackHook("Token received does not match token from Slack");
    debugSlackHook(req.body);
    res.sendStatus(403);
    return;
  }

  scrabblizedString = scrabblize(text);

  res.send({
    response_type: "in_channel",
    text: scrabblizedString
  });
}

function scrabblize(text) {
  var tokenizedText = text.split(" ");

  var convertedWords = tokenizedText.map(function(word) {
    if (isSlackEntity(word)) {
      return word;
    }
    return replaceLettersWithScrabbleTiles(word);
  });

  return convertedWords.join(":blank_scrabble:");
}

function isSlackEntity(word) {
  return word.startsWith('<') && word.endsWith('>');
}

function replaceLettersWithScrabbleTiles(word) {
  var rawText = entities.decode(word);
  var lowerText = rawText.toLowerCase();

  var result = lowerText.replace(/[a-z]/g, function(x) {
    return ":" + x + "_scrabble:";
  });

  return entities.encode(result);
}