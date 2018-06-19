var config = {
  slackbotPort: 9001,
  channelId: 'CB8SUCHAN',
  notificationMessages: [
    ":door: Someone's at the door! :bell:", 
    ":punch: Knock! Knock! Who's there?", 
    "You should probably get that. :point_up:"
  ],
  slackApi: {
    baseUrl: 'https://slack.com/api/',
    postMessageEndpoint: 'chat.postMessage'
  },
  cameraApi: {
    baseUrl: 'http://127.0.0.1:3000/api/',
    getPhotoEndpoint: 'photo'
  }
};

if (typeof module !== "undefined") {
  module.exports = config;
}